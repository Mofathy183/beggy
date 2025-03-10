import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import cookieParser from 'cookie-parser';
import app from '../../../app.js';
import { hashingPassword } from '../../utils/hash.js';
import { signToken } from '../../utils/jwt.js';

let csrfToken;
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
	csrfToken = response.body.data.csrfToken;
});

test('Should return a CSRF token', async () => {
	expect(csrfToken).toBeDefined();
});

describe('Base suitcases Route Tests To Get All Suitcases', () => {
	test('Should Get All Suitcases', async () => {
		await prisma.suitcases.createMany({
			data: suitcase,
		});

		const res = await request(app).get('/api/beggy/suitcases/');

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Retrieved All Suitcases Successfully');
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBe(7);
	});

	test('Should Get All Suitcases By Order and Page Limit', async () => {
		await prisma.suitcases.createMany({
			data: suitcase,
		});

		const res = await request(app).get(
			'/api/beggy/suitcases/?page=2&limit=3&sortBy=weight&order=desc'
		);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Retrieved All Suitcases Successfully');
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBe(3);
	});
});

describe('Base suitcases Route Tests To Get Suitcases By Search', () => {
	test('Should Get Suitcases by Search for Not Enum Fields', async () => {
		await prisma.suitcases.createMany({
			data: suitcase,
		});

		const res = await request(app)
			//* search by fields not Enum
			.get(`/api/beggy/suitcases/search?search=usb_port&field=features`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'Retrieved All Suitcases Successfully By Search'
		);
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeGreaterThan(0);
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
			`/api/beggy/suitcases/${suitcase.id}`
		);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Retrieved Suitcase By ID Successfully');
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

describe('Base suitcases Route Tests To Replace Suitecase For Only Admin and Member', () => {
	test('Should Replace Suitcase For Admin', async () => {
		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'admin@example.com',
				password: await hashingPassword('password'),
				role: 'ADMIN',
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
			},
		});

		const res = await request(app)
			.put(`/api/beggy/suitcases/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`)
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

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'Successfully Replaced Suitcase By Its ID'
		);
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
	test('Should Modify Suitcase For Admin', async () => {
		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'admin@example.com',
				password: await hashingPassword('password'),
				role: 'ADMIN',
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
				features: ['usb_port', 'waterproof'],
				wheels: 'spinner',
			},
		});

		const res = await request(app)
			.patch(`/api/beggy/suitcases/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`)
			.send({
				material: 'canvas',
				features: ['tsa_lock', 'compression_straps'],
				removeFeatures: ['usb_port'],
				wheels: 'two_wheel',
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'Successfully Modified Suitcase By Its ID'
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
			material: 'CANVAS',
			features: ['TSA_LOCK', 'COMPRESSION_STRAPS', 'WATERPROOF'],
			wheels: 'TWO_WHEEL',
		});
	});
});

describe('Base suitcases Route Tests Delete Suitcase By ID For Only Admin and Member', () => {
	test('Should Delete Suitcase For Admin', async () => {
		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'admin@example.com',
				password: await hashingPassword('password'),
				role: 'ADMIN',
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
			},
		});

		const res = await request(app)
			.delete(`/api/beggy/suitcases/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'Successfully Deleted Suitcase By Its ID'
		);
		expect(res.body.meta.totalDelete).toBe(1);
	});
});

describe('Base suitcases Route Tests Delete All Suitcases For Only Admin', () => {
	test('Should Delete All Suitcases For Admin', async () => {
		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'admin@example.com',
				password: await hashingPassword('password'),
				role: 'ADMIN',
			},
		});

		await prisma.suitcases.createMany({
			data: suitcase,
		});

		const res = await request(app)
			.delete(`/api/beggy/suitcases/delete-all`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`)
			.send({ confirmDelete: true });

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Delete All Suitcases');
		expect(res.body.meta.totalDelete).toBe(suitcase.length); // 5 suitcases created in the test
	});
});

////*=========================================={Suitcases Route For User}===================================

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
			.get(`/api/beggy/suitcases/user`)
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
				`/api/beggy/suitcases/user?field=features&search=scratch_resistant`
			)
			.set('Authorization', `Bearer ${signToken(user.id)}`);

		console.log('Response', res.body);

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
			.get(`/api/beggy/suitcases/user/${suitcase.id}`)
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
			.post(`/api/beggy/suitcases/user`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
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
			.post(`/api/beggy/suitcases/user/item/${suitcase.id}`)
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
			.post(`/api/beggy/suitcases/user/items/${suitcase.id}`)
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
			.put(`/api/beggy/suitcases/user/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
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
			.patch(`/api/beggy/suitcases/user/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
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
			.delete(`/api/beggy/suitcases/user/${suitcase.id}`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
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
			.delete(`/api/beggy/suitcases/user/all`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
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
			.delete(`/api/beggy/suitcases/user/item/${suitcase.id}`)
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
			.delete(`/api/beggy/suitcases/user/items/${suitcase.id}`)
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
			.delete(`/api/beggy/suitcases/user/items/all/${suitcase.id}`)
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
				`/api/beggy/suitcases/user/items/all/${suitcase.id}?field=category&search=electronics`
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
