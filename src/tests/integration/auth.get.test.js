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
	let user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser22@test.com',
				password: await hashingPassword('testing123'),
				birth: birthOfDate('2005-12-12'),
			},
		});

		token = signToken(user.id);
	});

	test('Should Authentic User Successfully', async () => {
		const res = await request(app)
			.get('/api/beggy/auth/me')
			.set('Cookie', [`accessToken=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "You've Authenticated Successfully",
		});

		expect(res.body.data).toMatchObject({
			id: user.id,
			firstName: 'John',
			lastName: 'Doe',
			email: 'testuser22@test.com',
			isActive: true,
			isEmailVerified: false,
		});
	});

	test('Should Return Error 401 Unauthorized Because User ID i not Valid', async () => {
		const res = await request(app)
			.get('/api/beggy/auth/me')
			.set('Cookie', [
				`accessToken=${signToken(user.id + 'fdf6sd5f6s5df')}`,
			]);

		expect(res.status).toBe(401);
		expect(res.body).toMatchObject({
			success: false,
			status: 'Unauthorized',
			message: 'User not found in the database. Please login again.',
		});
	});

	test('Should Return Error 401 Unauthorized Because JWT Token is Expired', async () => {
		const expiredToken = jwt.sign(
			{ id: user.id }, // your payload
			JWTConfig.secret, // use the same secret as in your app
			{ expiresIn: -10 } // token expired 10 seconds ago
		);

		const res = await request(app)
			.get('/api/beggy/auth/me')
			.set('Cookie', [`accessToken=${expiredToken}`]);

		expect(res.status).toBe(401);
		expect(res.body).toMatchObject({
			success: false,
			status: 'Unauthorized',
			message: 'Access token is expired or invalid. Please login again.',
		});
	});
});

describe('Auth API Tests For get permissions by role', () => {
	test('Should get user permissions', async () => {
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
			.get('/api/beggy/auth/permissions')
			.set('Cookie', [`accessToken=${signToken(user.id)}`]);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Get User Permissions',
		});

		expect(res.body.data).toBeDefined();
		expect(Array.isArray(res.body.data)).toBe(true);
	});
});

describe('Auth API Tests For Verify Email', () => {
	let user, token, expiredAt;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser22@test.com',
				password: await hashingPassword('testing123'),
				birth: birthOfDate('2005-12-12'),
			},
		});

		//* Generate a random password by crypto
		token = generateCryptoHashToken();
		expiredAt = setExpiredAt();
	});

	test('Should verify email for first time', async () => {
		expect(user.isEmailVerified).toBe(false);

		const userToken = await prisma.userToken.create({
			data: {
				userId: user.id,
				type: 'EMAIL_VERIFICATION',
				hashToken: token.hashToken,
				expiresAt: expiredAt,
			},
		});

		const res = await request(app).get(
			`/api/beggy/auth/verify-email?token=${token.token}&type=email_verification`
		);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Verified User Email',
		});

		expect(res.body.data.isEmailVerified).toBe(true);

		const deletedUserToken = await prisma.userToken.findUnique({
			where: { id: userToken.id },
		});

		expect(deletedUserToken).toBeNull();
	});

	test('Should verify email for Change Email', async () => {
		expect(user.isEmailVerified).toBe(false);

		const userToken = await prisma.userToken.create({
			data: {
				userId: user.id,
				type: 'CHANGE_EMAIL',
				hashToken: token.hashToken,
				expiresAt: expiredAt,
			},
		});

		const res = await request(app).get(
			`/api/beggy/auth/verify-email?token=${token.token}&type=change_email`
		);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Verified User Email',
		});

		expect(res.body.data.isEmailVerified).toBe(true);

		const deletedUserToken = await prisma.userToken.findUnique({
			where: { id: userToken.id },
		});

		expect(deletedUserToken).toBeNull();
	});
});
