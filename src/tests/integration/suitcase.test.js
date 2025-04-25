import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import cookieParser from 'cookie-parser';
import app from '../../../app.js';
import { hashingPassword } from '../../utils/hash.js';
import { signToken } from '../../utils/jwt.js';

let csrfToken;
let csrfSecret;
let cookies;

const suitcase = [
	{
		name: 'Bag 1',
		type: 'carry_on',
		color: 'green',
		size: 'small',
		capacity: 11.2,
		maxWeight: 12.55,
		weight: 1.5,
		material: 'nylon',
		features: ['usb_port'],
		wheels: 'spinner',
	},
	{
		name: 'Bag 2',
		type: 'soft_shell',
		color: 'blue',
		size: 'medium',
		capacity: 15.3,
		maxWeight: 16.88,
		weight: 2.2,
		material: 'polyester',
		features: ['scratch_resistant'],
		wheels: 'spinner',
	},
	{
		name: 'Bag 3',
		type: 'carry_on',
		color: 'red',
		size: 'large',
		capacity: 18.7,
		maxWeight: 20.33,
		weight: 2.8,
		material: 'leather',
		features: ['lightweight'],
		wheels: 'two_wheel',
	},
	{
		name: 'Bag 4',
		type: 'business',
		color: 'yellow',
		size: 'extra_large',
		capacity: 21.9,
		maxWeight: 23.5,
		weight: 3.4,
		material: 'fabric',
		features: ['telescopic_handle'],
		wheels: 'none',
	},
	{
		name: 'Bag 5',
		type: 'soft_shell',
		color: 'purple',
		size: 'small',
		capacity: 25.6,
		maxWeight: 27.11,
		weight: 4.1,
		material: 'polyester',
		features: ['waterproof'],
		wheels: 'four_wheel',
	},
	{
		name: 'Bag 6',
		type: 'carry_on',
		color: 'pink',
		size: 'large',
		capacity: 29.8,
		maxWeight: 31.33,
		weight: 4.7,
		material: 'leather',
		features: ['waterproof'],
		wheels: 'four_wheel',
	},
	{
		name: 'Bag 7',
		type: 'expandable',
		color: 'orange',
		size: 'medium',
		capacity: 34.2,
		maxWeight: 35.77,
		weight: 5.3,
		material: 'fabric',
		features: ['waterproof'],
		wheels: 'spinner',
	},
];

beforeAll(async () => {
	const response = await request(app).get('/api/beggy/auth/csrf-token');
	cookies = response.headers['set-cookie'];
	let secret = cookies
		.find((cookie) => cookie.startsWith('x-csrf-secret='))
		.split(';')[0];

	csrfSecret = secret.split('=')[1];
	csrfToken = response.body.data.csrfToken;
});

test('Should return a CSRF token', async () => {
	expect(csrfToken).toBeDefined();
	expect(csrfSecret).toBeDefined();
});

describe("Suitcases Route For User For Get User's Suitcases", () => {
	test("Should Get User's Suitcases", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		const mySuitcase = suitcase.map((s) => {
			return {
				...s,
				userId: user.id,
			};
		});

		await prisma.suitcases.createMany({
			data: mySuitcase,
		});

		const res = await request(app)
			.get(`/api/beggy/suitcases/`)
			.set('Authorization', `Bearer ${signToken(user.id)}`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'Retrieved Suitcases Belonging To User Successfully'
		);
		expect(res.body.data).toHaveLength(suitcase.length);
	});

	test("Should Get User's Suitcases By Search", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		const mySuitcase = suitcase.map((s) => {
			return {
				...s,
				userId: user.id,
			};
		});

		await prisma.suitcases.createMany({
			data: mySuitcase,
		});

		const res = await request(app)
			.get(
				`/api/beggy/suitcases?features=scratch_resistant`
			)
			.set('Authorization', `Bearer ${signToken(user.id)}`);

		console.log('Response', res.body);
        console.log('Response', res.body.meta.searchFilter.AND[0].features);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'Retrieved Suitcases Belonging To User Successfully By Search'
		);
		expect(res.body.data[0]).toMatchObject({
			features: ['SCRATCH_RESISTANT'],
		});
	});
});

describe('Suitcases Route For User For Get Suitcase Belong To User', () => {
	test('Should Get Suitcase Belong To User', async () => {
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
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port'],
				wheels: 'spinner',
				userId: user.id,
			},
		});

		const res = await request(app)
			.get(`/api/beggy/suitcases/${suitcase.id}`)
			.set('Authorization', `Bearer ${signToken(user.id)}`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'Retrieved Suitcase Belonging To User By Its ID Successfully'
		);
		expect(res.body.data).toMatchObject({
			id: suitcase.id,
			name: 'Test Suitcase',
			type: 'CARRY_ON',
			color: 'green',
			size: 'SMALL',
			capacity: 11.2,
			maxWeight: 12.55,
			weight: 1.5,
			material: 'NYLON',
			features: ['USB_PORT'],
			wheels: 'SPINNER',
		});
	});
});

describe('Suitcases Route For User For Creating Suitcase For User', () => {
	test('Should Create Suitcase For User', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		const res = await request(app)
			.post(`/api/beggy/suitcases/`)
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				name: 'Test Suitcase',
				type: 'carry_on',
				color: 'green',
				size: 'small',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port'],
				wheels: 'spinner',
			});

		console.log('Response', res.body);

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Created Suitcase For User Successfully');
		expect(res.body.data).toMatchObject({
			name: 'Test Suitcase',
			type: 'CARRY_ON',
			color: 'green',
			size: 'SMALL',
			capacity: 11.2,
			maxWeight: 12.55,
			weight: 1.5,
			material: 'NYLON',
			features: ['USB_PORT'],
			wheels: 'SPINNER',
		});
	});
});

describe("Suitcases Route For User For Replace User's Suitcase", () => {
	test("Should Replace User's Suitcase", async () => {
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
				features: ['usb_port'],
				wheels: 'spinner',
				userId: user.id,
			},
		});

		const res = await request(app)
			.put(`/api/beggy/suitcases/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				name: 'Test Suitcase 2',
				type: 'carry_on',
				color: 'blue',
				size: 'medium',
				capacity: 16.5,
				maxWeight: 18.85,
				weight: 5.5,
				material: 'leather',
				features: ['waterproof'],
				wheels: 'none',
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Replaced User's Suitcase By Its ID"
		);
		expect(res.body.data).toMatchObject({
			id: suitcase.id,
			name: 'Test Suitcase 2',
			type: 'CARRY_ON',
			color: 'blue',
			size: 'MEDIUM',
			capacity: 16.5,
			maxWeight: 18.85,
			weight: 5.5,
			material: 'LEATHER',
			features: ['WATERPROOF'],
			wheels: 'NONE',
			userId: user.id,
		});
	});
});

describe("Suitcases Route For User For Modify User's Suitcase", () => {
	test("Should Modify User's Suitcase", async () => {
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

		const res = await request(app)
			.patch(`/api/beggy/suitcases/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({
				material: 'leather',
				features: ['waterproof', 'tsa_lock'],
				removeFeatures: ['usb_port'],
				wheels: 'none',
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Modified User's Suitcase By Its ID"
		);
		expect(res.body.data).toMatchObject({
			material: 'LEATHER',
			features: ['WATERPROOF', 'TSA_LOCK', 'EXPANDABLE'],
			wheels: 'NONE',
			userId: user.id,
		});
	});
});

describe("Suitcases Route For User For Delete User's Suitcase By Its ID", () => {
	test("Should Delete User's Suitcase", async () => {
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

		const res = await request(app)
			.delete(`/api/beggy/suitcases/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Deleted User's Suitcase By Its ID"
		);
		expect(res.body.meta.totalDelete).toBe(1);
	});
});

describe("Suitcases Route For User For Delete All User's Suitcases", () => {
	test("Should Delete All User's Suitcases", async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'john@example.com',
				password: await hashingPassword('password'),
				role: 'USER',
			},
		});

		await prisma.suitcases.createMany({
			data: Array.from({ length: 5 }, (_, index) => ({
				name: `Test Suitcase ${index + 1}`,
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
			})),
		});

		const res = await request(app)
			.delete(`/api/beggy/suitcases/`)
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(user.id)}`)
			.send({ confirmDelete: true });

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			"Successfully Delete All User's Suitcases"
		);
		expect(res.body.meta.totalDelete).toBe(5);
	});
});
