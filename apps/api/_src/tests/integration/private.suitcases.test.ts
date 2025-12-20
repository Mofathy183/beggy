import request from 'supertest';
import type { PrismaClient } from '../generated/client/index.js';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { signToken } from '../../utils/jwt.js';
import { hashingPassword } from '../../utils/hash.js';
import { filterQuery } from '../setup.test.js';

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
		.find((cookie) => cookie.startsWith('X-CSRF-Secret='))
		.split(';')[0];

	csrfSecret = secret.split('=')[1];
	csrfToken = response.body.data.csrfToken;
});

test('Should return a CSRF token', async () => {
	expect(csrfToken).toBeDefined();
	expect(csrfSecret).toBeDefined();
});

//*======================================={Suitcase Private Route}==============================================

describe('Base suitcases Route Tests To Replace Suitcase For Only Admin and Member', () => {
	let admin, suitcase, token;

	beforeEach(async () => {
		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'admin@example.com',
				password: await hashingPassword('password'),
				role: 'ADMIN',
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
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port'],
				wheels: 'spinner',
			},
		});

		token = signToken(admin.id);
	});

	test('Should Replace Suitcase For Admin', async () => {
		const res = await request(app)
			.put(`/api/beggy/private/suitcases/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				name: 'Updated Test Suitcase',
				type: 'checked_luggage',
				color: 'pink',
				size: 'medium',
				capacity: 11.2,
				maxWeight: 12.55,
				weight: 1.5,
				material: 'canvas',
				features: ['tsa_lock', 'compression_straps'],
				wheels: 'two_wheel',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Replaced Suitcase By Its ID',
		});

		expect(res.body.data).toMatchObject({
			id: suitcase.id,
			name: 'Updated Test Suitcase',
			type: 'CHECKED_LUGGAGE',
			color: 'pink',
			size: 'MEDIUM',
			capacity: 11.2,
			maxWeight: 12.55,
			weight: 1.5,
			material: 'CANVAS',
			features: ['TSA_LOCK', 'COMPRESSION_STRAPS'],
			wheels: 'TWO_WHEEL',
		});
	});
});

describe('Base suitcases Route Tests Modify Suitcase For Only Admin and Member', () => {
	let admin, suitcase, token;

	beforeEach(async () => {
		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'admin@example.com',
				password: await hashingPassword('password'),
				role: 'ADMIN',
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
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port', 'waterproof'],
				wheels: 'spinner',
			},
		});

		token = signToken(admin.id);
	});

	test('Should Modify Suitcase For Admin', async () => {
		const res = await request(app)
			.patch(`/api/beggy/private/suitcases/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				material: 'canvas',
				features: ['tsa_lock', 'compression_straps'],
				removeFeatures: ['usb_port'],
				wheels: 'two_wheel',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Modified Suitcase By Its ID',
		});

		expect(res.body.data).toMatchObject({
			id: suitcase.id,
			material: 'CANVAS',
			features: ['TSA_LOCK', 'COMPRESSION_STRAPS', 'WATERPROOF'],
			wheels: 'TWO_WHEEL',
		});
	});
});

describe('Base suitcases Route Tests Delete Suitcase By ID For Only Admin and Member', () => {
	let admin, suitcase, token;

	beforeEach(async () => {
		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'admin@example.com',
				password: await hashingPassword('password'),
				role: 'ADMIN',
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
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port'],
				wheels: 'spinner',
			},
		});

		token = signToken(admin.id);
	});

	test('Should Delete Suitcase For Admin', async () => {
		const res = await request(app)
			.delete(`/api/beggy/private/suitcases/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Deleted Suitcase By Its ID',
		});

		expect(res.body.meta.totalDelete).toBe(1);
	});
});

describe('Base suitcases Route Tests Delete All Suitcases For Only Admin', () => {
	let admin, token;
	const filter = { size: 'small' };

	beforeEach(async () => {
		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'admin@example.com',
				password: await hashingPassword('password$1155'),
				role: 'admin',
			},
		});

		token = signToken(admin.id);
	});

	test('Should Delete All Suitcases For Admin', async () => {
		await prisma.suitcases.createMany({
			data: suitcase,
		});

		const res = await request(app)
			.delete(`/api/beggy/private/suitcases`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({ confirmDelete: true });

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Delete All Suitcases',
		});

		expect(res.body.meta.totalDelete).toBe(suitcase.length); // 5 suitcases created in the test
	});

	test('Should Delete Suitcase By Search For Admin', async () => {
		const mySuitcase = await prisma.suitcases.createMany({
			data: suitcase.filter((s) => s.size === filter.size),
		});

		const res = await request(app)
			.delete(`/api/beggy/private/suitcases?${filterQuery(filter)}`)
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
			message: 'Successfully Delete All Suitcases By Search',
		});

		expect(res.body.meta.totalDelete).toBe(mySuitcase.count);
	});
});

//*======================================={Suitcase Private Route}==============================================
