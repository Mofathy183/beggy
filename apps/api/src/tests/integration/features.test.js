import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { hashingPassword } from '../../utils/hash.js';
import { signToken, signRefreshToken } from '../../utils/jwt.js';

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

describe('Features API Tests For Auto Filling Fields When Creating Items', () => {
	test('Should Auto Filling volume and weight Fields of item', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		const res = await request(app)
			.post('/api/beggy/features/ai/auto-fill/item')
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				name: 'T-Shirt',
				category: 'clothing',
				quantity: 10,
			});

		console.log('Response: ', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Auto-Filled Item');
		expect(res.body.data).toMatchObject({
			volume: res.body.data.volume,
			weight: res.body.data.weight,
		});

		const item = await prisma.items.create({
			data: {
				name: 'T-Shirt',
				category: 'clothing',
				quantity: 10,
				weight: res.body.data.weight,
				volume: res.body.data.volume,
				color: 'White',
				userId: user.id,
			},
		});

		expect(item).toMatchObject({
			id: item.id,
			name: 'T-Shirt',
			category: 'CLOTHING',
			quantity: 10,
			isFragile: false,
			volume: item.volume,
			weight: item.weight,
		});
	});
});

describe('Features API Tests For Auto Filling Fields When Creating Bag', () => {
	test('Should Auto Filling capacity and maxWeight and weight Fields of item', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		const res = await request(app)
			.post('/api/beggy/features/ai/auto-fill/bag')
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				name: 'ninjahood',
				type: 'backpack',
				size: 'medium',
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Auto-Filled Bag');
		expect(res.body.data).toMatchObject({
			capacity: res.body.data.capacity,
			maxWeight: res.body.data.maxWeight,
			weight: res.body.data.weight,
		});

		const bag = await prisma.bags.create({
			data: {
				name: 'ninjahood',
				type: 'backpack',
				size: 'medium',
				color: 'Black',
				userId: user.id,
				capacity: res.body.data.capacity,
				maxWeight: res.body.data.maxWeight,
				weight: res.body.data.weight,
			},
		});

		expect(bag).toMatchObject({
			id: bag.id,
			name: 'ninjahood',
			type: 'BACKPACK',
			size: 'MEDIUM',
			capacity: bag.capacity,
			maxWeight: bag.maxWeight,
			weight: bag.weight,
		});
	});
});

describe('Features API Tests For Auto Filling Fields When Creating Suitcase', () => {
	test('Should Auto Filling capacity and maxWeight and weight Fields of Suitcase', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		const res = await request(app)
			.post('/api/beggy/features/ai/auto-fill/suitcase')
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				name: 'Coolife',
				brand: 'Coolife Luggage',
				type: 'carry_on',
				size: 'large',
				wheels: 'spinner',
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Auto-Filled Suitcase');
		expect(res.body.data).toMatchObject({
			capacity: res.body.data.capacity,
			maxWeight: res.body.data.maxWeight,
			weight: res.body.data.weight,
		});

		const suitcase = await prisma.suitcases.create({
			data: {
				name: 'Coolife',
				brand: 'Coolife Luggage',
				type: 'carry_on',
				size: 'large',
				wheels: 'spinner',
				color: 'Black',
				userId: user.id,
				capacity: res.body.data.capacity,
				maxWeight: res.body.data.maxWeight,
				weight: res.body.data.weight,
			},
		});

		expect(suitcase).toMatchObject({
			id: suitcase.id,
			name: 'Coolife',
			brand: 'Coolife Luggage',
			type: 'CARRY_ON',
			size: 'LARGE',
			wheels: 'SPINNER',
			capacity: suitcase.capacity,
			maxWeight: suitcase.maxWeight,
			weight: suitcase.weight,
		});
	});
});

describe('Features API Tests For Get User location By his IP', () => {
	test('Should Update User City and Country, and Add them to Database', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		const res = await request(app)
			.post(`/api/beggy/features/location`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				permission: 'granted',
			});

		console.log('Response body: ', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'Successfully updated user City and Country'
		);
		expect(res.body.data).toHaveProperty('city');
		expect(res.body.data).toHaveProperty('country');

		const updatedUser = await prisma.user.findUnique({
			where: {
				id: user.id,
			},
		});

		expect(updatedUser).toHaveProperty('city');
		expect(updatedUser).toHaveProperty('country');
	});
});

describe('Feature API Tests For Get Weather', () => {
	test("Should Get Weather Information for User's Location", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser@test.com',
				password: await hashingPassword('testing123'),
				city: 'New York',
				country: 'USA',
			},
		});

		const res = await request(app)
			.get('/api/beggy/features/weather')
			.set('Authorization', `Bearer ${signToken(user.id)}`);

		console.log('Response Body: ' + res);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'Successfully fetched weather information'
		);
	});
});
