import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import cookieParser from 'cookie-parser';
import app from '../../../app.js';
import { hashingPassword } from '../../utils/hash.js';
import { signToken } from '../../utils/jwt.js';

let csrfToken;
let cookies;

beforeAll(async () => {
	const response = await request(app).get('/api/beggy/auth/csrf-token');
	cookies = response.headers['set-cookie'];
	csrfToken = response.body.data.csrfToken;
});

test('Should return a CSRF token', async () => {
	expect(csrfToken).toBeDefined();
});

describe("Suitcases Route For User For Add User's Item to User's Suitcase", () => {
	test('Should Add Item By Its Id to Suitcase', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		const suitcase = await prisma.suitcases.create({
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

		const item = await prisma.items.create({
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

		const res = await request(app)
			.post(`/api/beggy/suitcase-items/${suitcase.id}/item`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				itemId: item.id,
			});

		console.log('Response', res.body);
		console.log(res.body.data.suitcaseItems);

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Added User's Item To User's Suitcase"
		);
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
	test('Should Add Multiple Items By Its Ids to Suitcase', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		const suitcase = await prisma.suitcases.create({
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

		const items = await prisma.items.findMany({
			where: { userId: user.id },
		});

		const myItems = items.map((itemId) => {
			return { itemId: itemId.id };
		});

		const res = await request(app)
			.post(`/api/beggy/suitcase-items/${suitcase.id}/items`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				itemsIds: myItems,
			});

		console.log('Response', res.body);

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Added User's Items To User's Suitcase"
		);
		expect(res.body.data.suitcaseItems.length).toBe(3);
		expect(res.body.data.suitcaseItems[0]).toMatchObject({
			item: {
				id: items[0].id,
				name: 'Test Item 1',
				category: 'ELECTRONICS',
				color: 'blue',
				weight: 0.2,
				quantity: 10,
				volume: 0.5,
				userId: user.id,
			},
		});
	});
});

describe("Suitcases Route For User For Delete Item From User's Suitcase", () => {
	test("Should Delete Item From User's Suitcase", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		const suitcase = await prisma.suitcases.create({
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

		const item = await prisma.items.create({
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

		const res = await request(app)
			.delete(`/api/beggy/suitcase-items/${suitcase.id}/item`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({ itemId: item.id });

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Deleted Item From User's Suitcase"
		);
		expect(res.body.meta.totalDelete).toBe(1);
	});
});

describe("Suitcases Route For User For Delete Items From User's Suitcase", () => {
	test("Should Delete Items From User's Suitcase", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		const suitcase = await prisma.suitcases.create({
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

		const items = await prisma.items.findMany({
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

		const myItems = items.map((item) => item.id);

		const res = await request(app)
			.delete(`/api/beggy//suitcase-items/${suitcase.id}/items`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				itemsIds: myItems,
				confirmDelete: true,
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Deleted Items From User's Suitcase"
		);
		expect(res.body.meta.totalDelete).toBe(5);
	});
});

describe("Suitcases Route For User For Delete All Items From User's Suitcase", () => {
	test("Should Delete All Items From User's Suitcase", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		const suitcase = await prisma.suitcases.create({
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

		const items = await prisma.items.findMany({
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

		const myItems = items.map((item) => item.id);

		const res = await request(app)
			.delete(`/api/beggy/suitcase-items/${suitcase.id}/items/bulk`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				confirmDelete: true,
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Delete All Items From User's Suitcase"
		);
		expect(res.body.meta.totalDelete).toBe(5);
	});

	test("Should Delete All Items From User's Suitcase By Search", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		const suitcase = await prisma.suitcases.create({
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

		const items = await prisma.items.findMany({
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

		const res = await request(app)
			.delete(
				`/api/beggy/suitcase-items/${suitcase.id}/items/bulk?field=category&search=electronics`
			)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				confirmDelete: true,
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Delete All Items From User's Suitcase By Search"
		);
		expect(res.body.meta.totalDelete).toBe(1);
	});
});
