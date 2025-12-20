import request from 'supertest';
import type { PrismaClient } from '../generated/client/index.js';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { hashingPassword } from '../../utils/hash.js';
import { signToken } from '../../utils/jwt.js';
import { filterQuery } from '../setup.test.js';

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
	let bag, item, user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		bag = await prisma.bags.create({
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

		item = await prisma.items.create({
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

		token = signToken(user.id);
	});

	test("Should Add User's Item By Id To User's Bag", async () => {
		const res = await request(app)
			.post(`/api/beggy/bag-items/${bag.id}/item`)
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			//* Send ItemId in the body
			.send({
				itemId: item.id,
			});

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Added User's Item To User's Bag",
		});

		expect(res.body.data).toMatchObject({
			id: bag.id,
			userId: user.id,
		});

		expect(res.body.data.bagItems[0].item).toMatchObject({
			id: item.id,
			userId: user.id,
		});
	});
});

describe("Bags Route For User For Add User's Items To User's Bag", () => {
	let bag, items, user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		bag = await prisma.bags.create({
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

		items = await prisma.items.findMany({
			where: { userId: user.id },
			select: { id: true },
		});

		token = signToken(user.id);
	});

	test('Should add Items By Its IDs To the bag', async () => {
		const myItems = items.map((itemId) => {
			return { itemId: itemId.id };
		});

		const res = await request(app)
			.post(`/api/beggy/bag-items/${bag.id}/items`)
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			//* Send ItemsIds in the body
			.send({
				itemsIds: myItems,
			});

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Added User's Items To User's Bag",
		});

		expect(res.body.data).toMatchObject({
			id: bag.id,
			userId: user.id,
		});

		expect(res.body.data.bagItems.length).toBe(items.length);

		res.body.data.bagItems.forEach((item) => {
			const itemIds = myItems.map((i) => i.itemId);
			expect(itemIds).toContain(item.item.id);
			expect(item.item.userId).toBe(user.id);
		});
	});
});

describe("Bags Route For User For Delete Items User's Bags", () => {
	let bag, items, user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		bag = await prisma.bags.create({
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

		items = await prisma.items.findMany({
			where: { userId: user.id },
			select: { id: true },
		});

		token = signToken(user.id);
	});

	test("Should Delete Items By They IDs from User's Bags", async () => {
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
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				itemsIds: myItems,
				confirmDelete: true,
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Deleted Items From User's Bag",
		});

		expect(res.body.data).toMatchObject({
			id: bag.id,
			userId: user.id,
		});

		expect(res.body.meta.totalDelete).toBe(items.length);
	});
});

describe("Bags Route For User For Delete Item From User's Bag", () => {
	let bag, items, user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		bag = await prisma.bags.create({
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

		items = await prisma.items.findMany({
			where: { userId: user.id },
			select: { id: true },
		});

		await prisma.bagItems.createMany({
			data: items.map((i) => {
				return {
					itemId: i.id,
					bagId: bag.id,
				};
			}),
		});

		token = signToken(user.id);
	});

	test("Should Delete Item By Its ID From User's Bag", async () => {
		const res = await request(app)
			.delete(`/api/beggy/bag-items/${bag.id}/item`)
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({ itemId: items[0].id });

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Deleted Item From User's Bag",
		});

		expect(res.body.data).toMatchObject({
			id: bag.id,
			userId: user.id,
		});

		expect(res.body.meta.totalDelete).toBe(1);
	});
});

describe("Bags Route For User For Delete All Items In User's Bag", () => {
	let bag, items, user, token;
	const filter = { category: 'electronics' };

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		bag = await prisma.bags.create({
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

		items = await prisma.items.findMany({
			where: { userId: user.id },
			select: { id: true },
		});

		token = signToken(user.id);
	});

	test("Should Delete All Items From User's Bag", async () => {
		const myItems = await prisma.bagItems.createMany({
			data: items.map((i) => {
				return {
					itemId: i.id,
					bagId: bag.id,
				};
			}),
		});

		const res = await request(app)
			.delete(`/api/beggy/bag-items/${bag.id}/items/bulk`)
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				confirmDelete: true,
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Deleted All Items From User's Bag",
		});

		expect(res.body.meta.totalDelete).toBe(myItems.count);
	});

	test("Should Delete All Items From User's Bag By Search", async () => {
		const myItems = await prisma.bagItems.createMany({
			data: items
				.filter((i) => i.category === filter.category)
				.map((i) => {
					return {
						itemId: i.id,
						bagId: bag.id,
					};
				}),
		});

		const res = await request(app)
			.delete(
				`/api/beggy/bag-items/${bag.id}/items/bulk?${filterQuery(filter)}`
			)
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				confirmDelete: true,
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Deleted All Items From User's Bag By Search",
		});

		expect(res.body.meta.totalDelete).toBe(myItems.count);
	});
});
