// import request from 'supertest';
// import type { PrismaClient } from '../generated/client/index.js';
// import prisma from '../../../prisma/prisma.js';
// import app from '../../../app.js';
// import { hashingPassword } from '../../utils/hash.js';
// import { signToken, signRefreshToken } from '../../utils/jwt.js';

// let csrfToken;
// let csrfSecret;
// let cookies;

// beforeAll(async () => {
// 	const response = await request(app).get('/api/beggy/auth/csrf-token');
// 	cookies = response.headers['set-cookie'];
// 	const secret = cookies
// 		.find((cookie) => cookie.startsWith('X-CSRF-Secret='))
// 		.split(';')[0];

// 	csrfSecret = secret.split('=')[1];
// 	csrfToken = response.body.data.csrfToken;
// });

// test('Should return a CSRF token', async () => {
// 	expect(csrfToken).toBeDefined();
// 	expect(csrfSecret).toBeDefined();
// });

// describe('Features API Tests For Get User location By his IP', () => {
// 	test('Should Update User City and Country, and Add them to Database', async () => {
// 		const user = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Doe',
// 				email: 'testuser@test.com',
// 				password: await hashingPassword('testing123'),
// 			},
// 		});

// 		const res = await request(app)
// 			.post(`/api/beggy/features/location`)
// 			.set('Cookie', cookies)
// 			.set('X-CSRF-Secret', csrfSecret)
// 			.set('x-csrf-token', csrfToken)
// 			.set('Authorization', `Bearer ${signToken(user.id)}`)
// 			.send({
// 				permission: 'granted',
// 			});

// 		console.log('Response body: ', res.body);

// 		expect(res.status).toBe(200);
// 		expect(res.body.success).toBe(true);
// 		expect(res.body.message).toBe(
// 			'Successfully updated user City and Country'
// 		);
// 		expect(res.body.data).toHaveProperty('city');
// 		expect(res.body.data).toHaveProperty('country');

// 		const updatedUser = await prisma.user.findUnique({
// 			where: {
// 				id: user.id,
// 			},
// 		});

// 		expect(updatedUser).toHaveProperty('city');
// 		expect(updatedUser).toHaveProperty('country');
// 	});
// });

// describe('Feature API Tests For Get Weather', () => {
// 	test("Should Get Weather Information for User's Location", async () => {
// 		const user = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Doe',
// 				email: 'testuser@test.com',
// 				password: await hashingPassword('testing123'),
// 				city: 'New York',
// 				country: 'USA',
// 			},
// 		});

// 		const res = await request(app)
// 			.get('/api/beggy/features/weather')
// 			.set('Authorization', `Bearer ${signToken(user.id)}`);

// 		console.log('Response Body: ' + res);

// 		expect(res.status).toBe(200);
// 		expect(res.body.success).toBe(true);
// 		expect(res.body.message).toBe(
// 			'Successfully fetched weather information'
// 		);
// 	});
// });
