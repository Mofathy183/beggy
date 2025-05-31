import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { hashingPassword } from '../../utils/hash.js';
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
			},
		});

		const userToken1 = await prisma.userToken.create({
			data: {
				userId: user.id,
				type: 'PASSWORD_RESET',
				hashToken: hashToken,
				expiresAt: expiredAt,
			},
		});

		console.log('Before Reset Password', user.password);

		//* Send a password reset link
		const res = await request(app)
			.patch(`/api/beggy/auth/reset-password/${token}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				password: 'testing12377@',
				confirmPassword: 'testing12377@',
			});

		console.log('RESPONSE: ', res.body);
		console.log(
			'After Reset Password',
			await prisma.user.findUnique({
				where: { id: user.id },
				select: { password: true },
			})
		);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"You've successfully changed your password"
		);
		expect(res.body.data).toBe("You've Change Password Successfully");

		const userToken2 = await prisma.userToken.findUnique({
			where: {
				id: userToken1.id,
			},
		});

		expect(userToken2).toBeNull();
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

		console.log('Before Update Password', user.password);

		const res = await request(app)
			.patch('/api/beggy/auth/update-password')
			.set('Cookie', [...cookies, `accessToken=${signToken(user.id)}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
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
		expect(res.body.message).toBe(
			"You've successfully changed your password"
		);
		expect(res.body.data).toBe("You've Updated Password Successfully");
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
			.set('Cookie', [...cookies, `accessToken=${signToken(user.id)}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				firstName: 'Jane',
				lastName: 'Doe',
				gender: 'male',
			});

		console.log('After Update User Data');
		const updatedUser = await prisma.user.findUnique({
			where: { id: user.id },
		});

		console.log('RESPONSE BODY', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Updated Your Profile');
		expect(res.body.data).toBe("You've Updated Your Profile Successfully");

		expect(updatedUser).toMatchObject({
			id: user.id,
			firstName: 'Jane',
			lastName: 'Doe',
			gender: 'MALE',
		});
	});
});

describe('Auth API Tests For Change Email', () => {
	test.skip("Should change a user's email", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser77@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		const res = await request(app)
			.patch('/api/beggy/auth/change-email')
			.set('Cookie', [...cookies, `accessToken=${signToken(user.id)}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				email: 'mofathy1833@gmail.com',
			});

		console.log('RESPONSE BODY', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Updated Your Email');
		expect(res.body.data).toBe(
			'Check your email inbox to verify your email'
		);

		const userEmail = await prisma.user.findUnique({
			where: { id: user.id },
			select: { email: true },
		});

		expect(userEmail.email).toBe('mofathy1833@gmail.com');
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
				email: 'mofathy1833@gmail.com',
				password: await hashingPassword('testing123'),
			},
		});

		const res = await request(app)
			.patch('/api/beggy/auth/forgot-password')
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				email: 'mofathy1833@gmail.com',
			});

		console.log('RESPONSE', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Reset password email send Successfully');
		expect(res.body.data).toBe(
			'Check your email inbox to reset your password'
		);
	});
});
