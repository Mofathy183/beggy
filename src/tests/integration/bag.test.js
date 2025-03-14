import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { hashingPassword } from '../../utils/hash.js';
import { signToken } from '../../utils/jwt.js';

let csrfToken;
let cookies;
const bags = [
	{
		name: 'Bag 1',
		type: 'laptop_bag',
		color: 'green',
		size: 'small',
		capacity: 11.2,
		maxWeight: 12.55,
		weight: 1.5,
		material: 'nylon',
		features: ['usb_port'],
	},
	{
		name: 'Bag 2',
		type: 'backpack',
		color: 'blue',
		size: 'medium',
		capacity: 15.3,
		maxWeight: 16.88,
		weight: 2.2,
		material: 'polyester',
		features: ['multiple_pockets'],
	},
	{
		name: 'Bag 3',
		type: 'travel_bag',
		color: 'red',
		size: 'large',
		capacity: 18.7,
		maxWeight: 20.33,
		weight: 2.8,
		material: 'leather',
		features: ['lightweight'],
	},
	{
		name: 'Bag 4',
		type: 'duffel',
		color: 'yellow',
		size: 'extra_large',
		capacity: 21.9,
		maxWeight: 23.5,
		weight: 3.4,
		material: 'fabric',
		features: ['trolley_sleeve'],
	},
	{
		name: 'Bag 5',
		type: 'tote',
		color: 'purple',
		size: 'small',
		capacity: 25.6,
		maxWeight: 27.11,
		weight: 4.1,
		material: 'polyester',
		features: ['waterproof'],
	},
	{
		name: 'Bag 6',
		type: 'travel_bag',
		color: 'pink',
		size: 'large',
		capacity: 29.8,
		maxWeight: 31.33,
		weight: 4.7,
		material: 'leather',
		features: ['waterproof'],
	},
	{
		name: 'Bag 7',
		type: 'handbag',
		color: 'orange',
		size: 'medium',
		capacity: 34.2,
		maxWeight: 35.77,
		weight: 5.3,
		material: 'fabric',
		features: ['waterproof'],
	},
];

beforeAll(async () => {
	const response = await request(app).get('/api/beggy/auth/csrf-token');
	cookies = response.headers['set-cookie'];
	csrfToken = response.body.data.csrfToken;
});

test('Should return a CSRF token', async () => {
	expect(csrfToken).toBeDefined();
});



describe('Bags Route For User For Get All Bags Belongs To User', () => {
	test('Should Get All Bags Belongs To User', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		const manyBags = bags.map((bag) => ({
			...bag,
			userId: user.id,
		}));

		await prisma.bags.createMany({
			data: manyBags,
		});

		const res = await request(app)
			.get(`/api/beggy/bags/`)
			.set('Authorization', `Bearer ${signToken(user.id)}`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Retrieved Bags User Has');
		expect(res.body.data.length).toBeGreaterThan(4);
	});

	test('Should Get All Bags Belongs To User By searching', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		const manyBags = bags.map((bag) => ({
			...bag,
			userId: user.id,
		}));

		await prisma.bags.createMany({
			data: manyBags,
		});

		const res = await request(app)
			.get(`/api/beggy/bags/?field=features&search=usb_port`)
			.set('Authorization', `Bearer ${signToken(user.id)}`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Retrieved Bags User Has');
		expect(res.body.data.length).toBeGreaterThan(0);
	});
});

describe('Bags Route For User For Get User Bag By Its ID', () => {
	test('Should Get User Bag By Its ID', async () => {
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

		const res = await request(app)
			.get(`/api/beggy/bags/${bag.id}`)
			.set('Authorization', `Bearer ${signToken(user.id)}`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Retrieved Bag User Has');
		expect(res.body.data).toMatchObject({
			id: bag.id,
			name: 'Test Bag 1',
			type: 'LAPTOP_BAG',
			color: 'green',
			size: 'SMALL',
			capacity: 11.2,
			maxWeight: 12.55,
			weight: 1.5,
			material: 'NYLON',
			features: ['USB_PORT'],
			userId: user.id,
		});
	});
});

describe('Bags Route For User For Create Bag For User', () => {
	test('Should Create Bag For User', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		const res = await request(app)
			.post(`/api/beggy/bags/`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				name: 'Test Bag 1',
				type: 'laptop_bag',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port'],
			});

		console.log('Response', res.body);

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Created Bag For User');
		expect(res.body.data).toMatchObject({
			name: 'Test Bag 1',
			type: 'LAPTOP_BAG',
			color: 'green',
			size: 'SMALL',
			capacity: 11.2,
			maxWeight: 12.55,
			weight: 1.5,
			material: 'NYLON',
			features: ['USB_PORT'],
			userId: user.id,
		});

		const findBag = await prisma.bags.findFirst({
			where: {
				id: res.body.data.id,
			},
		});

		expect(findBag).toBeTruthy();
	});
});


describe("Bags Route For User For Replace User's Bag", () => {
	test("Should Replace User's Bag", async () => {
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

		const res = await request(app)
			.put(`/api/beggy/bags/${bag.id}`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				name: 'Updated Test Bag 1',
				type: 'backpack',
				color: 'blue',
				size: 'medium',
				capacity: 15.2,
				maxWeight: 17.55,
				weight: 2.5,
				material: 'leather',
				features: ['waterproof', 'expandable'],
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe("Successfully Replace User's Bag");
		expect(res.body.data).toMatchObject({
			name: 'Updated Test Bag 1',
			type: 'BACKPACK',
			color: 'blue',
			size: 'MEDIUM',
			capacity: 15.2,
			maxWeight: 17.55,
			weight: 2.5,
			material: 'LEATHER',
			features: ['WATERPROOF', 'EXPANDABLE'],
		});
	});
});

describe("Bags Route For User For Modify User's Bag", () => {
	test("Should Modify User's Bag", async () => {
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
				features: [
					'usb_port',
					'anti_theft',
					'multiple_pockets',
					'waterproof',
				],
				userId: user.id,
			},
		});

		const res = await request(app)
			.patch(`/api/beggy/bags/${bag.id}`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				material: 'leather',
				features: ['waterproof', 'expandable'],
				removeFeatures: ['usb_port', 'multiple_pockets'],
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe("Successfully Modified User's Bag");
		expect(res.body.data).toMatchObject({
			material: 'LEATHER',
			features: ['WATERPROOF', 'EXPANDABLE', 'ANTI_THEFT'],
		});
	});
});

describe("Bags Route For User For Delete User's Bags By ID", () => {
	test("Should Delete User's Bag By ID", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		const bag1 = await prisma.bags.create({
			data: {
				name: 'Test Bag 1',
				type: 'laptop_bag',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 1.5,
				material: 'nylon',
				features: [
					'usb_port',
					'anti_theft',
					'multiple_pockets',
					'waterproof',
				],
				userId: user.id,
			},
		});

		const res = await request(app)
			.delete(`/api/beggy/bags/${bag1.id}`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe("Successfully Deleted User's Bag");
	});
});

describe("Bags Route For User For Delete All User's Bags", () => {
	test("Should Delete All User's Bags", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		await prisma.bags.createMany({
			data: [
				{
					name: 'Test Bag 1',
					type: 'laptop_bag',
					color: 'green',
					size: 'small',
					capacity: 11.2,
					maxWeight: 12.55,
					weight: 1.5,
					material: 'nylon',
					features: [
						'usb_port',
						'anti_theft',
						'multiple_pockets',
						'waterproof',
					],
					userId: user.id,
				},
				{
					name: 'Test Bag 2',
					type: 'backpack',
					color: 'blue',
					size: 'medium',
					capacity: 15.2,
					maxWeight: 17.55,
					weight: 2.5,
					material: 'leather',
					features: ['waterproof', 'expandable', 'anti_theft'],
					userId: user.id,
				},
			],
		});

		const res = await request(app)
			.delete(`/api/beggy/bags/`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				confirmDelete: true,
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe("Successfully Deleted All User's Bags");
		expect(res.body.data.count).toBe(2);
	});

	test("Should Delete All User's Bags By Search", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'user@example.com',
				password: await hashingPassword('password$1155'),
				role: 'user',
			},
		});

		await prisma.bags.createMany({
			data: [
				{
					name: 'Test Bag 1',
					type: 'laptop_bag',
					color: 'green',
					size: 'small',
					capacity: 11.2,
					maxWeight: 12.55,
					weight: 1.5,
					material: 'nylon',
					features: [
						'usb_port',
						'anti_theft',
						'multiple_pockets',
						'waterproof',
					],
					userId: user.id,
				},
				{
					name: 'Test Bag 2',
					type: 'backpack',
					color: 'blue',
					size: 'medium',
					capacity: 15.2,
					maxWeight: 17.55,
					weight: 2.5,
					material: 'leather',
					features: ['waterproof', 'expandable', 'anti_theft'],
					userId: user.id,
				},
			],
		});

		const res = await request(app)
			.delete(
				`/api/beggy/bags/?field=material&search=nylon`
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
			"Successfully Deleted All User's Bags By Search Filter"
		);
		expect(res.body.data.count).toBe(1);
	});
});

