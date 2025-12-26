import request from 'supertest';
import type { PrismaClient } from '../generated/client/index.js';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { hashingPassword, verifyPassword } from '../../utils/hash.js';
import { generateCryptoHashToken } from '../../utils/jwt.js';
import { setExpiredAt } from '../../utils/userHelper.js';
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

describe('Auth API Tests For Reset Password', () => {
	let user, token, expiredAt, userToken;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser22@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		//* Generate a random password by crypto
		token = generateCryptoHashToken();
		expiredAt = setExpiredAt();

		userToken = await prisma.userToken.create({
			data: {
				userId: user.id,
				type: 'PASSWORD_RESET',
				hashToken: token.hashToken,
				expiresAt: expiredAt,
			},
		});
	});

	test("Should reset a user's password", async () => {
		//* Send a password reset link
		const res = await request(app)
			.patch(`/api/beggy/auth/reset-password/${token.token}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				password: 'testing12377@',
				confirmPassword: 'testing12377@',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "You've successfully changed your password",
			data: "You've Change Password Successfully",
		});

		const userToken2 = await prisma.userToken.findUnique({
			where: {
				id: userToken.id,
			},
		});

		expect(userToken2).toBeNull();

		const updatedUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { password: true },
		});

		const isMatch = await verifyPassword(
			'testing12377@',
			updatedUser.password
		);
		expect(isMatch).toBe(true); // ✅ Password was updated successfully
	});
});

//* Forgot Password tests Will send and email so it takes a while to complete
describe('Auth API Tests For Forgot Password', () => {
	let user;

	beforeEach(async () => {
		//* ✅ First, register a new user before sending a password reset link
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'mofathy1833@gmail.com',
				password: await hashingPassword('testing123'),
			},
		});
	});

	test.skip('Should send a password reset link', async () => {
		const res = await request(app)
			.patch('/api/beggy/auth/forgot-password')
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				email: 'mofathy1833@gmail.com',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Reset password email send Successfully',
			data: 'Check your email inbox to reset your password',
		});

		const userToken = await prisma.userToken.findUnique({
			where: { userId: user.id },
		});

		expect(userToken.type).toBe('PASSWORD_RESET');
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
