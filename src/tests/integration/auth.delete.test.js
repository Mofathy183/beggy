import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { hashingPassword } from '../../utils/hash.js';
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
			.set('Cookie', [...cookies, `accessToken=${signToken(user.id)}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken);

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
		expect(res.body.data).toBe('Your Account Deactivated Successfully');
	});
});
