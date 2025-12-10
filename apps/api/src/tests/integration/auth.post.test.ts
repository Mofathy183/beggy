import request from 'supertest';
import type { PrismaClient } from '../generated/client/index.js';
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

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({
			success: true,
			message: "You've Signed Up Successfully",
			data: 'Will send email to verify your account',
		});

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
	beforeEach(async () => {
		// ✅ First, register a new user before login
		await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser22@test.com',
				password: await hashingPassword('testing123'),
			},
		});
	});

	test('Should login a user', async () => {
		const res = await request(app)
			.post('/api/beggy/auth/login')
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				email: 'testuser22@test.com',
				password: 'testing123',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "You've logged In Successfully",
			data: 'Will send email to verify your account',
		});

		const authCookies = res.headers['set-cookie'];

		expect(authCookies).toBeDefined();
		const accessTokenCookie = authCookies.find((c) =>
			c.startsWith('accessToken=')
		);
		const refreshTokenCookie = authCookies.find((c) =>
			c.startsWith('refreshToken=')
		);

		expect(accessTokenCookie).toMatch(/HttpOnly/);
		expect(refreshTokenCookie).toMatch(/HttpOnly/);
	});
});

describe('Auth API Tests For Get Access Token', () => {
	let refreshToken;

	beforeEach(async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser99@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		refreshToken = signRefreshToken(user.id);
	});

	test('Should get an access token', async () => {
		const res = await request(app)
			.post('/api/beggy/auth/refresh-token')
			.set('Cookie', [...cookies, `refreshToken=${refreshToken}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Access token sent via cookie',
			data: 'New access token has been successfully generated',
		});

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
	let user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser88@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		token = signToken(user.id);
	});

	test('Should logout a user', async () => {
		expect(user.isActive).toBe(true);

		const res = await request(app)
			.post('/api/beggy/auth/logout')
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken);

		const logoutUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { isActive: true },
		});

		expect(logoutUser.isActive).toBe(false);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "You're Logged Out Successfully",
			data: "You're Out Now",
		});

		const authCookies = res.headers['set-cookie'];

		// Check that all relevant cookies are cleared
		expect(authCookies).toEqual(
			expect.arrayContaining([
				expect.stringMatching(/accessToken=;/),
				expect.stringMatching(/refreshToken=;/),
				expect.stringMatching(/Expires=/), // ensures it's expired
			])
		);
	});
});

describe('Auth API Tests For send Verification Email', () => {
	let user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'mofathy1833@gmail.com',
				password: await hashingPassword('testing123'),
			},
		});

		token = signToken(user.id);
	});

	test.skip('Should send a verification email', async () => {
		const res = await request(app)
			.post('/api/beggy/auth/send-verification-email')
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				email: 'mofathy1833@gmail.com',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Verification email send Successfully',
			data: 'Check your email inbox to verify your email',
		});

		const userToken = await prisma.userToken.findUnique({
			where: { userId: user.id },
		});

		expect(userToken.type).toBe('EMAIL_VERIFICATION');
	});
});
