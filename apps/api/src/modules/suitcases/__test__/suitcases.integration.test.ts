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

describe("Suitcases Route For User For Get User's Suitcases", () => {
	let user, mySuitcase, token;
	const filter = { features: 'scratch_resistant' };

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

		mySuitcase = suitcase.map((s) => {
			return {
				...s,
				userId: user.id,
			};
		});

		token = signToken(user.id);
	});

	test("Should Get User's Suitcases", async () => {
		await prisma.suitcases.createMany({
			data: mySuitcase,
		});

		const res = await request(app)
			.get(`/api/beggy/suitcases/`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Retrieved Suitcases Belonging To User Successfully',
		});

		expect(res.body.data).toHaveLength(suitcase.length);

		for (const s of res.body.data) {
			expect(s.userId).toBe(user.id);
		}
	});

	test("Should Get User's Suitcases By Search", async () => {
		const count = await prisma.suitcases.createMany({
			data: mySuitcase.filter((f) =>
				f.features.includes(filter.features)
			),
		});

		const res = await request(app)
			.get(`/api/beggy/suitcases?${filterQuery(filter)}`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message:
				'Retrieved Suitcases Belonging To User Successfully By Search',
		});

		expect(res.body.data.length).toBe(count.count);

		for (const s of res.body.data) {
			expect(s.userId).toBe(user.id);
			expect(s.features).toContain(filter.features.toUpperCase());
		}
	});
});

describe('Suitcases Route For User For Get Suitcase Belong To User', () => {
	let user, suitcase, token;

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
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port'],
				wheels: 'spinner',
				userId: user.id,
			},
		});

		token = signToken(user.id);
	});

	test('Should Get Suitcase Belong To User', async () => {
		const res = await request(app)
			.get(`/api/beggy/suitcases/${suitcase.id}`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message:
				'Retrieved Suitcase Belonging To User By Its ID Successfully',
		});

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
	let user, token;

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

		token = signToken(user.id);
	});

	test('Should Create Suitcase For User', async () => {
		const res = await request(app)
			.post(`/api/beggy/suitcases/`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
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

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Created Suitcase For User Successfully',
		});

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
	let user, suitcase, token;

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
				weight: 1.5,
				material: 'nylon',
				features: ['usb_port'],
				wheels: 'spinner',
				userId: user.id,
			},
		});

		token = signToken(user.id);
	});

	test("Should Replace User's Suitcase", async () => {
		const res = await request(app)
			.put(`/api/beggy/suitcases/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
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

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Replaced User's Suitcase By Its ID",
		});

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
	let user, suitcase, token;

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

		token = signToken(user.id);
	});

	test("Should Modify User's Suitcase", async () => {
		const res = await request(app)
			.patch(`/api/beggy/suitcases/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				material: 'leather',
				features: ['waterproof', 'tsa_lock'],
				removeFeatures: ['usb_port'],
				wheels: 'none',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Modified User's Suitcase By Its ID",
		});

		expect(res.body.data).toMatchObject({
			material: 'LEATHER',
			features: ['WATERPROOF', 'TSA_LOCK', 'EXPANDABLE'],
			wheels: 'NONE',
			userId: user.id,
		});
	});
});

describe("Suitcases Route For User For Delete User's Suitcase By Its ID", () => {
	let user, suitcase, token;

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

		token = signToken(user.id);
	});

	test("Should Delete User's Suitcase", async () => {
		const res = await request(app)
			.delete(`/api/beggy/suitcases/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Deleted User's Suitcase By Its ID",
		});

		expect(res.body.data).toMatchObject({
			id: suitcase.id,
			name: suitcase.name,
		});
	});
});

describe('Suitcases Route - User Delete All Suitcases', () => {
	let user, token;
	let userSuitcases;
	const filter = { features: 'scratch_resistant', material: 'leather' };

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

		userSuitcases = suitcase.map((s) => ({
			...s,
			userId: user.id,
		}));

		token = signToken(user.id);
	});

	test("should delete all user's suitcases", async () => {
		await prisma.suitcases.createMany({ data: userSuitcases });

		const res = await request(app)
			.delete(`/api/beggy/suitcases/`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({ confirmDelete: true });

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Delete All User's Suitcases",
		});

		expect(res.body.meta.totalDelete).toBe(userSuitcases.length);
	});

	test("should delete user's suitcases by filter", async () => {
		const filteredSuitcases = userSuitcases.filter(
			(s) =>
				s.features?.includes(filter.features) &&
				s.material === filter.material
		);

		await prisma.suitcases.createMany({ data: filteredSuitcases });

		const res = await request(app)
			.delete(`/api/beggy/suitcases?${filterQuery(filter)}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({ confirmDelete: true });

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "Successfully Delete All User's Suitcases By Search",
		});

		expect(res.body.meta.totalDelete).toBe(filteredSuitcases.length);
	});
});

//*======================================={Suitcase Public Route}==============================================

describe('Base suitcases Route Tests To Get All Suitcases', () => {
	const filter = { page: 2, limit: 3, sortBy: 'weight', order: 'desc' };

	beforeEach(async () => {
		await prisma.suitcases.createMany({
			data: suitcase,
		});
	});

	test('Should Get All Suitcases', async () => {
		const res = await request(app).get('/api/beggy/public/suitcases');

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Retrieved All Suitcases Successfully',
		});

		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBe(suitcase.length);
	});

	test('Should Get All Suitcases By Order and Page Limit', async () => {
		const res = await request(app).get(
			`/api/beggy/public/suitcases?${filterQuery(filter)}`
		);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Retrieved All Suitcases Successfully',
		});

		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBe(filter.limit);
	});
});

describe('Base suitcases Route Tests To Get Suitcases By Search', () => {
	const filter = { features: 'usb_port' };

	test('Should Get Suitcases by Search for Not Enum Fields', async () => {
		const mySuitcase = await prisma.suitcases.createMany({
			data: suitcase.filter((f) => f.features.includes(filter.features)),
		});

		const res = await request(app)
			//* search by fields not Enum
			.get(`/api/beggy/public/suitcases?${filterQuery(filter)}`);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Retrieved All Suitcases Successfully By Search',
		});

		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBe(mySuitcase.count);
	});
});

describe('Base suitcases Route Tests To Suitcase By Its ID', () => {
	test('Should Get Suitcase By ID', async () => {
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
			},
		});

		const res = await request(app).get(
			`/api/beggy/public/suitcases/${suitcase.id}`
		);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Retrieved Suitcase By ID Successfully',
		});

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

//*======================================={Suitcase Public Route}==============================================

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
