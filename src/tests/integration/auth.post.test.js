import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { hashingPassword } from '../../utils/hash.js';
import { signToken, signRefreshToken, verifyToken } from '../../utils/jwt.js';

let csrfToken;
let csrfSecret;
let cookies;

beforeAll(async () => {
	const response = await request(app).get('/api/beggy/auth/csrf-token');
	cookies = response.headers['set-cookie'];
	let secret = cookies
		.find((cookie) => cookie.startsWith('X-CSRF-Secret='))
		.split(';')[0];

	csrfSecret = secret.split('=')[1];
	csrfToken = response.body.data.csrfToken;
});

test('Should return a CSRF token', async () => {
	expect(csrfToken).toBeDefined();
	expect(csrfSecret).toBeDefined();
});

describe('Auth API Tests For SignUp', () => {
	test('Should register a new user', async () => {
		const res = await request(app)
			.post('/api/beggy/auth/signup')
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser@test.com',
				password: 'testing123',
				confirmPassword: 'testing123',
			});

		console.log('Response', res.body);

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe("You've Signed Up Successfully");
		expect(res.body.data).toBe('Will send email to verify your account');

		//*✅ Verify user in DB
		const user = await prisma.user.findUnique({
			where: { email: 'testuser@test.com' },
			select: {
				firstName: true,
				lastName: true,
				email: true,
			},
		});

		expect(user).not.toBeNull();
		expect(user).toMatchObject({
			firstName: 'John',
			lastName: 'Doe',
			email: 'testuser@test.com',
		});
	});
});

describe('Auth API Tests For Login', () => {
	test('Should login a user', async () => {
		// ✅ First, register a new user before login
		await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser22@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		const res = await request(app)
			.post('/api/beggy/auth/login')
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				email: 'testuser22@test.com',
				password: 'testing123',
			});

		console.log('Response: ', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe("You've logged In Successfully");
		expect(res.body.data).toBe('Will send email to verify your account');

		// ✅ Ensure user exists in DB
		const user = await prisma.user.findUnique({
			where: { email: 'testuser22@test.com' },
		});

		expect(user).not.toBeNull();
		expect(user).toMatchObject({
			email: 'testuser22@test.com',
		});
	});
});

describe('Auth API Tests For Get Access Token', () => {
	test('Should get an access token', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser99@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		const res = await request(app)
			.post('/api/beggy/auth/refresh-token')
			.set('Cookie', [
				...cookies,
				`refreshToken=${signRefreshToken(user.id)}`,
			])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken);

		console.log('RESPONSE BODY', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Access token sent via cookie');
		expect(res.body.data).toBe(
			'New access token has been successfully generated'
		);
		expect(res.headers['set-cookie']).toBeDefined();

		// Extract the cookie
		const cookie = res.headers['set-cookie'][0].split(';')[0].split('='); // Get "access_token=..." part

		const token = verifyToken(cookie[1]);

		const foundUser = await prisma.user.findUnique({
			where: { id: token.id },
		});

		expect(foundUser).toBeDefined();
		expect(foundUser).toMatchObject({
			id: token.id,
			firstName: 'John',
			lastName: 'Doe',
			email: 'testuser99@test.com',
			isActive: true,
		});
	});
});

describe('Auth API Tests For Logout', () => {
	test('Should logout a user', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser88@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		console.log('Before Logout User isActive', user.isActive);

		const res = await request(app)
			.post('/api/beggy/auth/logout')
			.set('Cookie', [...cookies, `accessToken=${signToken(user.id)}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken);

		console.log(
			'After Logout User',
			await prisma.user.findUnique({
				where: { id: user.id },
				select: { isActive: true },
			})
		);

		console.log('RESPONSE BODY', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe("You're Logged Out Successfully");
		expect(res.body.data).toBe("You're Out Now");
	});
});

describe('Auth API Tests For send Verification Email', () => {
	test.skip('Should send a verification email', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'mofathy1833@gmail.com',
				password: await hashingPassword('testing123'),
			},
		});

		const res = await request(app)
			.post('/api/beggy/auth/send-verification-email')
			.set('Cookie', [...cookies, `accessToken=${signToken(user.id)}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				email: 'mofathy1833@gmail.com',
			});

		console.log('RESPONSE BODY', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Verification email send Successfully');
		expect(res.body.data).toBe(
			'Check your email inbox to verify your email'
		);
	});
});
