import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import cookieParser from 'cookie-parser';
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

describe("Bags Route For User For Add User's Item To User's Bag", () => {
	test("Should Add User's Item By Id To User's Bag", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		const bag = await prisma.bags.create({
			data: {
				name: 'Test Bag 1',
				type: 'laptop_bag',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port'],
				userId: user.id,
			},
		});

		const item = await prisma.items.create({
			data: {
				name: 'Test Item 1',
				category: 'electronics',
				color: 'blue',
				weight: 0.2,
				quantity: 10,
				volume: 0.5,
				userId: user.id,
			},
		});

		const res = await request(app)
			.post(`/api/beggy/bag-items/${bag.id}/item`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			//* Send ItemId in the body
			.send({
				itemId: item.id,
			});

		console.log('Response', res.body);
		console.log('bag Items', res.body.data.bagItems);

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Added User's Item To User's Bag"
		);
	});
});

describe("Bags Route For User For Add User's Items To User's Bag", () => {
	test('Should add Items By Its IDs To the bag', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		const bag = await prisma.bags.create({
			data: {
				name: 'Test Bag 1',
				type: 'laptop_bag',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port'],
				userId: user.id,
			},
		});

		await prisma.items.createMany({
			data: [
				{
					name: 'Test Item 1',
					category: 'electronics',
					color: 'blue',
					weight: 0.2,
					quantity: 10,
					volume: 0.5,
					userId: user.id,
				},
				{
					name: 'Test Item 3',
					category: 'medicine',
					color: 'red',
					weight: 0.8,
					quantity: 5,
					volume: 0.1,
					userId: user.id,
				},
				{
					name: 'Test Item 2',
					category: 'furniture',
					color: 'blue',
					weight: 0.4,
					quantity: 2,
					volume: 0.7,
					userId: user.id,
				},
			],
		});

		const items = await prisma.items.findMany({
			where: { userId: user.id },
		});

		const myItems = items.map((itemId) => {
			return { itemId: itemId.id };
		});

		const res = await request(app)
			.post(`/api/beggy/bag-items/${bag.id}/items`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			//* Send ItemsIds in the body
			.send({
				itemsIds: myItems,
			});

		console.log('Response', res.body);
		console.log('Response Bag Items', res.body.data.bagItems);

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Added User's Items To User's Bag"
		);
		expect(res.body.data.bagItems).toHaveLength(items.length);
	});
});

describe("Bags Route For User For Delete Items User's Bags", () => {
	test("Should Delete Items By They IDs from User's Bags", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		const bag = await prisma.bags.create({
			data: {
				name: 'Test Bag 1',
				type: 'laptop_bag',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port'],
				userId: user.id,
			},
		});

		await prisma.items.createMany({
			data: [
				{
					name: 'Test Item 1',
					category: 'electronics',
					color: 'blue',
					weight: 0.2,
					quantity: 10,
					volume: 0.5,
					userId: user.id,
				},
				{
					name: 'Test Item 3',
					category: 'medicine',
					color: 'red',
					weight: 0.8,
					quantity: 5,
					volume: 0.1,
					userId: user.id,
				},
				{
					name: 'Test Item 2',
					category: 'furniture',
					color: 'blue',
					weight: 0.4,
					quantity: 2,
					volume: 0.7,
					userId: user.id,
				},
			],
		});

		const items = await prisma.items.findMany({
			where: { userId: user.id },
		});

		const myItems = items.map((itemId) => {
			return itemId.id;
		});

		await prisma.bagItems.createMany({
			data: myItems.map((item) => {
				return {
					itemId: item,
					bagId: bag.id,
				};
			}),
		});

		const res = await request(app)
			.delete(`/api/beggy/bag-items/${bag.id}/items`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				itemsIds: myItems,
				confirmDelete: true,
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Deleted Items From User's Bag"
		);
		expect(res.body.meta.totalDelete).toBe(3);
	});
});

describe("Bags Route For User For Delete Item From User's Bag", () => {
	test("Should Delete Item By Its ID From User's Bag", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		const bag = await prisma.bags.create({
			data: {
				name: 'Test Bag 1',
				type: 'laptop_bag',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port'],
				userId: user.id,
			},
		});

		await prisma.items.createMany({
			data: [
				{
					name: 'Test Item 1',
					category: 'electronics',
					color: 'blue',
					weight: 0.2,
					quantity: 10,
					volume: 0.5,
					userId: user.id,
				},
				{
					name: 'Test Item 2',
					category: 'furniture',
					color: 'blue',
					weight: 0.4,
					quantity: 2,
					volume: 0.7,
					userId: user.id,
				},
			],
		});

		const item = await prisma.items.findMany({
			where: { userId: user.id },
		});

		await prisma.bagItems.createMany({
			data: item.map((i) => {
				return {
					itemId: i.id,
					bagId: bag.id,
				};
			}),
		});

		const res = await request(app)
			.delete(`/api/beggy/bag-items/${bag.id}/item`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({ itemId: item[0].id });

		console.log('Response', res.body);
		console.log('Bag Items', res.body.data.bagItems);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Deleted Item From User's Bag"
		);
		expect(res.body.meta.totalDelete).toBe(1);
	});
});

describe("Bags Route For User For Delete All Items In User's Bag", () => {
	test("Should Delete All Items From User's Bag", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		const bag = await prisma.bags.create({
			data: {
				name: 'Test Bag 1',
				type: 'laptop_bag',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port'],
				userId: user.id,
			},
		});

		await prisma.items.createMany({
			data: [
				{
					name: 'Test Item 1',
					category: 'electronics',
					color: 'blue',
					weight: 0.2,
					quantity: 10,
					volume: 0.5,
					userId: user.id,
				},
				{
					name: 'Test Item 2',
					category: 'furniture',
					color: 'blue',
					weight: 0.4,
					quantity: 2,
					volume: 0.7,
					userId: user.id,
				},
			],
		});

		const item = await prisma.items.findMany({
			where: { userId: user.id },
		});

		await prisma.bagItems.createMany({
			data: item.map((i) => {
				return {
					itemId: i.id,
					bagId: bag.id,
				};
			}),
		});

		const res = await request(app)
			.delete(`/api/beggy/bag-items/${bag.id}/items/bulk`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				confirmDelete: true,
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Deleted All Items From User's Bag"
		);
		expect(res.body.meta.totalDelete).toBe(2);
	});

	test("Should Delete All Items From User's Bag By Search", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		const bag = await prisma.bags.create({
			data: {
				name: 'Test Bag 1',
				type: 'laptop_bag',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port'],
				userId: user.id,
			},
		});

		await prisma.items.createMany({
			data: [
				{
					name: 'Test Item 1',
					category: 'electronics',
					color: 'blue',
					weight: 0.2,
					quantity: 10,
					volume: 0.5,
					userId: user.id,
				},
				{
					name: 'Test Item 1',
					category: 'electronics',
					color: 'blue',
					weight: 0.2,
					quantity: 10,
					volume: 0.5,
					userId: user.id,
				},
				{
					name: 'Test Item 1',
					category: 'electronics',
					color: 'blue',
					weight: 0.2,
					quantity: 10,
					volume: 0.5,
					userId: user.id,
				},
				{
					name: 'Test Item 2',
					category: 'furniture',
					color: 'blue',
					weight: 0.4,
					quantity: 2,
					volume: 0.7,
					userId: user.id,
				},
			],
		});

		const item = await prisma.items.findMany({
			where: { userId: user.id },
		});

		await prisma.bagItems.createMany({
			data: item.map((i) => {
				return {
					itemId: i.id,
					bagId: bag.id,
				};
			}),
		});

		const res = await request(app)
			.delete(
				`/api/beggy/bag-items/${bag.id}/items/bulk?category=electronics`
			)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				confirmDelete: true,
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Deleted All Items From User's Bag By Search"
		);
		expect(res.body.meta.totalDelete).toBe(3);
	});
});
