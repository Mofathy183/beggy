import request from 'supertest';
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

describe('Auth API Tests For Change Password', () => {
	let user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser55@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		token = signToken(user.id);
	});

	test("Should Change user's password", async () => {
		const res = await request(app)
			.patch('/api/beggy/auth/change-password')
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				currentPassword: 'testing123',
				newPassword: 'testing123456',
				confirmPassword: 'testing123456',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Password changed successfully',
			data: 'Your password has been updated.',
		});

		const updatedUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { password: true },
		});

		const isMatch = await verifyPassword(
			'testing123456',
			updatedUser.password
		);
		expect(isMatch).toBe(true); // ✅ Password was updated successfully
	});
});

describe('Auth API Tests For Edit Profile', () => {
	let user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser55@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		token = signToken(user.id);
	});

	test("Should Edit a user's Profile", async () => {
		const res = await request(app)
			.patch('/api/beggy/auth/edit-profile')
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				firstName: 'Jane',
				lastName: 'Doe',
				gender: 'male',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Profile updated successfully',
			data: 'Your profile information has been updated.',
		});

		const updatedUser = await prisma.user.findUnique({
			where: { id: user.id },
		});

		expect(updatedUser).toMatchObject({
			id: user.id,
			firstName: 'Jane',
			lastName: 'Doe',
			gender: 'MALE',
		});
	});
});

describe('Auth API Tests For Change Email', () => {
	let user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser55@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		token = signToken(user.id);
	});

	test.skip("Should change a user's email", async () => {
		const res = await request(app)
			.patch('/api/beggy/auth/change-email')
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				email: 'mofathy1833@gmail.com',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Updated Your Email',
			data: 'Check your email inbox to verify your email',
		});

		const userToken = await prisma.userToken.findUnique({
			where: { userId: user.id },
		});

		expect(userToken.type).toBe('CHANGE_EMAIL');

		const userEmail = await prisma.user.findUnique({
			where: { id: user.id },
			select: { email: true },
		});

		expect(userEmail.email).toBe('mofathy1833@gmail.com');
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
