import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import cookieParser from 'cookie-parser';
import app from '../../../app.js';
import { hashingPassword } from '../../utils/hash.js';
import { generateCryptoHashToken } from '../../utils/jwt.js';
import { setExpiredAt } from '../../utils/userHelper.js';
import { signToken, signRefreshToken, verifyToken } from '../../utils/jwt.js';

let csrfToken;
let csrfSecret;
let cookies;

beforeAll(async () => {
	const response = await request(app).get('/api/beggy/auth/csrf-token');
	cookies = response.headers['set-cookie'];
	let secret = cookies
		.find((cookie) => cookie.startsWith('x-csrf-secret='))
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
			.set('x-csrf-secret', csrfSecret)
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
		expect(res.body.message).toBe('User Signed Up Successfully');

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
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				email: 'testuser22@test.com',
				password: 'testing123',
			});

		console.log('Response: ', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('User logged In Successfully');

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

describe('Auth API Tests For Reset Password', () => {
	test("Should reset a user's password", async () => {
		//* Generate a random password by crypto
        const { token, hashToken } = generateCryptoHashToken();
        const expiredAt = setExpiredAt();
    
        // ✅ First, register a new user before sending a password reset link
        const user = await prisma.user.create({
            data: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'testuser44@test.com',
                password: await hashingPassword('testing123'),
                passwordResetToken: hashToken,
                passwordResetExpiredAt: expiredAt,
            },
        });

		console.log('Before Reset Password', user.password);

		//* Send a password reset link
		const res = await request(app)
			.patch(`/api/beggy/auth/reset-password/${token}`)
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				password: 'testing12377@',
				confirmPassword: 'testing12377@',
			});

		console.log("RESPONSE: ", res.body);
		console.log(
			'After Reset Password',
			await prisma.user.findUnique({
				where: { id: res.body.data.id },
				select: { password: true },
			})
		);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('User Change Password Successfully');
		expect(res.body.data).toMatchObject({
			id: res.body.data.id,
			firstName: 'John',
			lastName: 'Doe',
			email: 'testuser44@test.com',
		});
	});
});

describe('Auth API Tests For Update User Password', () => {
	test("Should update a user's password", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser55@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		const token = signToken(user.id);

		console.log('Before Update Password', user.password);

		const res = await request(app)
			.patch('/api/beggy/auth/update-password')
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				currentPassword: 'testing123',
				newPassword: 'testing123456',
				confirmPassword: 'testing123456',
			});

		console.log(
			'After Update Password',
			await prisma.user.findUnique({
				where: { id: user.id },
				select: { password: true },
			})
		);

		console.log('RESPONSE BODY', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('User Updated Password Successfully');
		expect(res.body.data).toMatchObject({
			id: user.id,
			firstName: 'John',
			lastName: 'Doe',
			email: 'testuser55@test.com',
		});
	});
});

describe('Auth API Tests For Update User Data', () => {
	test("Should update a user's data", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser66@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		console.log('Before Update User Data', user);

		const res = await request(app)
			.patch('/api/beggy/auth/update-user-data')
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				firstName: 'Jane',
				lastName: 'Doe',
				email: 'testuser66@test.com',
				gender: 'male',
			});

		console.log(
			'After Update User Data',
			await prisma.user.findUnique({
				where: { id: user.id },
			})
		);

		console.log('RESPONSE BODY', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Updated User Profile');
		expect(res.body.data).toMatchObject({
			id: user.id,
			firstName: 'Jane',
			lastName: 'Doe',
			email: 'testuser66@test.com',
			gender: 'MALE',
		});
	});
});

describe('Auth API Tests For Deactivate', () => {
	test('Should deactivate a user', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser77@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		console.log('Before Deactivate User', user.isActive);

		const res = await request(app)
			.delete('/api/beggy/auth/deactivate')
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`);

		console.log(
			'After Deactivate User',
			await prisma.user.findUnique({
				where: { id: user.id },
				select: { isActive: true },
			})
		);

		console.log('RESPONSE BODY', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Deactivated User Account');
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
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`);

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
		expect(res.body.message).toBe('User Logged Out Successfully');
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

		const refreshToken = signRefreshToken(user.id);

		const res = await request(app)
			.post('/api/beggy/auth/refresh-token')
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${refreshToken}`)
			.send({
				refreshToken: refreshToken,
			});

		console.log('RESPONSE BODY', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Access Token Sending Via Cookie');
		expect(res.body.data).toBe('Access Token Generated');
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

////* Forgot Password tests Will send and email so it takes a while to complete
describe('Auth API Tests For Forgot Password', () => {
	test.skip('Should send a password reset link', async () => {
		// ✅ First, register a new user before sending a password reset link
		await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser33@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		const res = await request(app)
			.patch('/api/beggy/auth/forgot-password')
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.send({
				email: 'testuser33@test.com',
			});

		console.log('RESPONSE', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Reset password email sent successfully');
		expect(res.body.data).toBe(
			'Check your email for password reset instructions.'
		);
	});
});
