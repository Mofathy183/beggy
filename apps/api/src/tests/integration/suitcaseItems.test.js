import request from 'supertest';
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

describe("Suitcases Route For User For Add User's Item to User's Suitcase", () => {
	let user, item, suitcase, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		suitcase = await prisma.suitcases.create({
			data: {
				name: 'Test Suitcase',
				type: 'carry_on',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 2.5,
				material: 'nylon',
				features: ['usb_port'],
				wheels: 'spinner',
				userId: user.id,
			},
		});

		item = await prisma.items.create({
			data: {
				name: 'Test Item',
				category: 'clothing',
				color: 'blue',
				weight: 0.5,
				volume: 0.2,
				quantity: 10,
				userId: user.id,
			},
		});

		token = signToken(user.id);
	});

	test('Should Add Item By Its Id to Suitcase', async () => {
		const res = await request(app)
			.post(`/api/beggy/suitcase-items/${suitcase.id}/item`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				itemId: item.id,
			});

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Added User's Item To User's Suitcase",
		});

		expect(res.body.data).toMatchObject({
			id: suitcase.id,
			userId: user.id,
		});

		expect(res.body.data.suitcaseItems[0]).toMatchObject({
			item: {
				id: item.id,
				name: 'Test Item',
				category: 'CLOTHING',
				color: 'blue',
				weight: 0.5,
				volume: 0.2,
				quantity: 10,
				userId: user.id,
			},
		});
	});
});

describe("Suitcases Route For User For Add User's Items to User's Suitcase", () => {
	let user, items, suitcase, itemsIdsArray, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		suitcase = await prisma.suitcases.create({
			data: {
				name: 'Test Suitcase',
				type: 'carry_on',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 2.5,
				material: 'nylon',
				features: ['usb_port'],
				wheels: 'spinner',
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
			select: { id: true, userId: true },
		});

		itemsIdsArray = items.map((t) => t.id);

		token = signToken(user.id);
	});

	test('Should Add Multiple Items By Its Ids to Suitcase', async () => {
		const myItems = items.map((itemId) => {
			return { itemId: itemId.id };
		});

		const res = await request(app)
			.post(`/api/beggy/suitcase-items/${suitcase.id}/items`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				itemsIds: myItems,
			});

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Added User's Items To User's Suitcase",
		});

		expect(res.body.data.suitcaseItems.length).toBe(myItems.length);

		for (const t of res.body.data.suitcaseItems) {
			expect(itemsIdsArray).toContain(t.item.id);
			expect(t.item.userId).toBe(user.id);
		}
	});
});

describe("Suitcases Route For User For Delete Item From User's Suitcase", () => {
	let user, item, suitcase, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		suitcase = await prisma.suitcases.create({
			data: {
				name: 'Test Suitcase 1',
				type: 'carry_on',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 2.5,
				material: 'nylon',
				features: ['usb_port', 'expandable'],
				wheels: 'spinner',
				userId: user.id,
			},
		});

		item = await prisma.items.create({
			data: {
				name: 'Test Item',
				category: 'clothing',
				color: 'blue',
				weight: 0.5,
				volume: 0.2,
				quantity: 10,
				userId: user.id,
			},
		});

		await prisma.suitcaseItems.create({
			data: {
				suitcaseId: suitcase.id,
				itemId: item.id,
			},
		});

		token = signToken(user.id);
	});

	test("Should Delete Item From User's Suitcase", async () => {
		const res = await request(app)
			.delete(`/api/beggy/suitcase-items/${suitcase.id}/item`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({ itemId: item.id });

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Deleted Item From User's Suitcase",
		});

		expect(res.body.meta.totalDelete).toBe(1);

		for (const t of res.body.data.suitcaseItems) {
			expect(t.item).not.toMatchObject({ id: item.id });
		}
	});
});

describe("Suitcases Route For User For Delete Items From User's Suitcase", () => {
	let user, items, suitcase, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		suitcase = await prisma.suitcases.create({
			data: {
				name: 'Test Suitcase 1',
				type: 'carry_on',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 2.5,
				material: 'nylon',
				features: ['usb_port', 'expandable'],
				wheels: 'spinner',
				userId: user.id,
			},
		});

		await prisma.items.createMany({
			data: Array.from({ length: 5 }, (_, index) => ({
				name: `Test Item ${index + 1}`,
				category: 'clothing',
				color: 'blue',
				weight: 0.5,
				volume: 0.2,
				quantity: 10,
				userId: user.id,
			})),
		});

		items = await prisma.items.findMany({
			where: {
				userId: user.id,
			},
		});

		await prisma.suitcaseItems.createMany({
			data: items.map((item) => ({
				suitcaseId: suitcase.id,
				itemId: item.id,
			})),
		});

		token = signToken(user.id);
	});

	test("Should Delete Items From User's Suitcase", async () => {
		const myItems = items.map((item) => item.id);

		const res = await request(app)
			.delete(`/api/beggy/suitcase-items/${suitcase.id}/items`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				itemsIds: myItems,
				confirmDelete: true,
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Deleted Items From User's Suitcase",
		});

		expect(res.body.meta.totalDelete).toBe(myItems.length);

		for (const t of res.body.data.suitcaseItems) {
			expect(myItems).not.toContain(t.item.id);
		}
	});
});

describe("Suitcases Route For User For Delete All Items From User's Suitcase", () => {
	let user, items, suitcase, token;
	const filter = {};

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		suitcase = await prisma.suitcases.create({
			data: {
				name: 'Test Suitcase 1',
				type: 'carry_on',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 2.5,
				material: 'nylon',
				features: ['usb_port', 'expandable'],
				wheels: 'spinner',
				userId: user.id,
			},
		});

		await prisma.items.createMany({
			data: [
				{
					name: 'Test Item 1',
					category: 'clothing',
					color: 'blue',
					weight: 0.5,
					volume: 0.2,
					quantity: 10,
					userId: user.id,
				},
				{
					name: 'Test Item 2',
					category: 'clothing',
					color: 'blue',
					weight: 0.5,
					volume: 0.2,
					quantity: 10,
					userId: user.id,
				},
				{
					name: 'Test Item 3',
					category: 'electronics',
					color: 'blue',
					weight: 0.5,
					volume: 0.2,
					quantity: 10,
					userId: user.id,
				},
			],
		});

		items = await prisma.items.findMany({
			where: {
				userId: user.id,
			},
		});

		await prisma.suitcaseItems.createMany({
			data: items.map((item) => ({
				suitcaseId: suitcase.id,
				itemId: item.id,
			})),
		});

		token = signToken(user.id);
	});

	test("Should Delete All Items From User's Suitcase", async () => {
		filter.limit = 4;
		const myItems = items.map((t) => t.id);

		const res = await request(app)
			.delete(
				`/api/beggy/suitcase-items/${suitcase.id}/items/bulk?${filterQuery(filter)}`
			)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				confirmDelete: true,
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Delete All Items From User's Suitcase",
		});

		expect(res.body.meta.totalDelete).toBe(items.length);

		for (const t of res.body.data.suitcaseItems) {
			expect(myItems).not.toContain(t.item.id);
		}
	});

	test("Should Delete All Items From User's Suitcase By Search", async () => {
		filter.category = 'CLOTHING';
		filter.color = 'blue';

		const myItems = items
			.filter(
				(t) =>
					t.category === filter.category && t.color === filter.color
			)
			.map((t) => t.id);

		const res = await request(app)
			.delete(
				`/api/beggy/suitcase-items/${suitcase.id}/items/bulk?${filterQuery(filter)}`
			)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				confirmDelete: true,
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message:
				"Successfully Delete All Items From User's Suitcase By Search",
		});

		expect(res.body.meta.totalDelete).toBe(myItems.length);

		for (const t of res.body.data.suitcaseItems) {
			expect(myItems).not.toContain(t.item.id);
		}
	});
});
