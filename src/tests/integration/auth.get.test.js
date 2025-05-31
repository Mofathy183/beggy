import request from 'supertest';
import jwt from 'jsonwebtoken';
import { JWTConfig } from '../../config/env.js';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { hashingPassword } from '../../utils/hash.js';
import { generateCryptoHashToken } from '../../utils/jwt.js';
import { setExpiredAt, birthOfDate } from '../../utils/userHelper.js';
import { signToken } from '../../utils/jwt.js';

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

describe('Auth API Tests For Authentic User For Frontend', () => {
	test('Should Authentic User Successfully', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser22@test.com',
				password: await hashingPassword('testing123'),
				birth: birthOfDate('2005-12-12'),
			},
		});

		const res = await request(app)
			.get('/api/beggy/auth/me')
			.set('Cookie', [`accessToken=${signToken(user.id)}`]);

		console.log('Response: ', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe("You've Authenticated Successfully");
		expect(res.body.data).toMatchObject({
			firstName: 'John',
			lastName: 'Doe',
			email: 'testuser22@test.com',
			isActive: true,
			isEmailVerified: false,
			role: 'USER',
		});
	});

	test('Should Return Error 401 Unauthorized Because User ID i not Valid', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser22@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		const res = await request(app)
			.get('/api/beggy/auth/me')
			.set('Cookie', [
				`accessToken=${signToken(user.id + 'fdf6sd5f6s5df')}`,
			]);

		console.log('Response: ', res.body);

		expect(res.status).toBe(401);
		expect(res.body.status).toBe('Unauthorized');
	});

	test('Should Return Error 401 Unauthorized Because JWT Token is Expired', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser22@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		const expiredToken = jwt.sign(
			{ id: user.id }, // your payload
			JWTConfig.secret, // use the same secret as in your app
			{ expiresIn: -10 } // token expired 10 seconds ago
		);

		const res = await request(app)
			.get('/api/beggy/auth/me')
			.set('Cookie', [`accessToken=${expiredToken}`]);

		console.log('Response: ', res.body);

		expect(res.status).toBe(401);
		expect(res.body.status).toBe('Unauthorized');
	});
});

describe('Auth API Tests For get permissions by role', () => {
	test('Should get user permissions', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'mofathy1833@gmail.com',
				password: await hashingPassword('testing123'),
			},
		});

		const res = await request(app)
			.get('/api/beggy/auth/permissions')
			.set('Cookie', [`accessToken=${signToken(user.id)}`]);

		console.log('RESPONSE BODY', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Get User Permissions');
		expect(res.body.data).toBeDefined();
		expect(Array.isArray(res.body.data)).toBe(true);
	});
});

describe('Auth API Tests For Verify Email', () => {
	test('Should verify email for first time', async () => {
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
			},
		});

		expect(user.isEmailVerified).toBe(false);

		const userToken1 = await prisma.userToken.create({
			data: {
				userId: user.id,
				type: 'EMAIL_VERIFICATION',
				hashToken: hashToken,
				expiresAt: expiredAt,
			},
		});

		const res = await request(app).get(
			`/api/beggy/auth/verify-email?token=${token}&type=email_verification`
		);

		console.log('RESPONSE BODY', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Verified User Email');
		expect(res.body.data.isEmailVerified).toBe(true);

		const userToken2 = await prisma.userToken.findUnique({
			where: { id: userToken1.id },
		});

		expect(userToken2).toBeNull();
	});

	test('Should verify email for Change Email', async () => {
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
			},
		});

		expect(user.isEmailVerified).toBe(false);

		const userToken1 = await prisma.userToken.create({
			data: {
				userId: user.id,
				type: 'CHANGE_EMAIL',
				hashToken: hashToken,
				expiresAt: expiredAt,
			},
		});

		const res = await request(app).get(
			`/api/beggy/auth/verify-email?token=${token}&type=change_email`
		);

		console.log('RESPONSE BODY', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Verified User Email');
		expect(res.body.data.isEmailVerified).toBe(true);

		const userToken2 = await prisma.userToken.findUnique({
			where: { id: userToken1.id },
		});

		expect(userToken2).toBeNull();
	});
});
