import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { hashingPassword } from '../../utils/hash.js';

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
const items = [
	{
		name: 'Test Item 3',
		quantity: 20,
		category: 'books',
		weight: 0.2,
		volume: 0.005,
		color: 'green',
	},
	{
		name: 'Test Item 1',
		quantity: 100,
		category: 'clothing',
		weight: 1.5,
		volume: 0.05,
		color: 'blue',
	},
	{
		name: 'Test Item 2',
		quantity: 50,
		category: 'electronics',
		weight: 0.5,
		volume: 0.01,
		color: 'red',
	},
	{
		name: 'Test Item 3',
		quantity: 20,
		category: 'books',
		weight: 0.2,
		volume: 0.005,
		color: 'green',
	},
	{
		name: 'Test Item 1',
		quantity: 100,
		category: 'clothing',
		weight: 1.5,
		volume: 0.05,
		color: 'blue',
	},
	{
		name: 'Test Item 2',
		quantity: 50,
		category: 'electronics',
		weight: 0.5,
		volume: 0.01,
		color: 'red',
	},
	{
		name: 'Test Item 3',
		quantity: 20,
		category: 'books',
		weight: 0.2,
		volume: 0.005,
		color: 'green',
	},
];
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
const users = [
	{
		firstName: 'John',
		lastName: 'Doe',
		email: 'testuser123@example.com',
		password: await hashingPassword('password123'),
	},
	{
		firstName: 'Jane',
		lastName: 'Smith',
		email: 'testuser456@example.com',
		password: await hashingPassword('password456'),
	},
	{
		firstName: 'Bob',
		lastName: 'Johnson',
		email: 'testuser789@example.com',
		password: await hashingPassword('password789'),
	},
	{
		firstName: 'Alice',
		lastName: 'Williams',
		email: 'testuser101@example.com',
		password: await hashingPassword('password101'),
	},
	{
		firstName: 'Frank',
		lastName: 'Williams',
		email: 'testuser708@example.com',
		password: await hashingPassword('password101'),
	},
];

//*======================================={Users Public Route}==============================================

describe('User API Tests For Get User Public Data', () => {
	test('Get User Public Data', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser123@example.com',
				password: await hashingPassword('password123'),
			},
		});

		console.log('USER', user);

		const res = await request(app).get(
			`/api/beggy/public/users/${user.id}`
		);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('User Retrieved By Its ID Successfully');
		expect(res.body.data).toMatchObject({
			id: user.id,
			firstName: 'John',
			lastName: 'Doe',
			email: 'testuser123@example.com',
		});

		const isUser = await prisma.user.findUnique({ where: { id: user.id } });

		expect(isUser).not.toBeNull();
		expect(isUser).toMatchObject({
			id: isUser.id,
			firstName: 'John',
			lastName: 'Doe',
			email: 'testuser123@example.com',
		});
	});
});

describe('User API Tests For Search For Users Public Profiles', () => {
	test('Search for User by his first and last name', async () => {
		await prisma.user.createMany({
			data: users,
		});

		const res = await request(app).get(
			`/api/beggy/public/users?firstName=John&lastName=Doe`
		);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Users Found Successfully By Search');
		expect(res.body.data[0]).toMatchObject({
			id: res.body.data[0].id,
			firstName: 'John',
			lastName: 'Doe',
			email: 'testuser123@example.com',
		});

		console.log('Response', res.body);
		console.log('Response data', res.body.data);

		const isUsers = await prisma.user.findMany({
			where: { firstName: 'John', lastName: 'Doe' },
		});

		expect(isUsers[0]).toMatchObject({
			id: isUsers[0].id,
			firstName: 'John',
			lastName: 'Doe',
			email: 'testuser123@example.com',
		});
	});

	test('Search for User', async () => {
		await prisma.user.createMany({
			data: users,
		});

		const res = await request(app).get(`/api/beggy/public/users`);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Users Found Successfully');
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeGreaterThan(0);

		console.log('Response', res.body);
		console.log('Response data', res.body.data);

		const isUsers = await prisma.user.findMany({
			where: {},
			take: res.body.meta.limit,
			skip: res.body.meta.offset,
		});

		expect(Array.isArray(isUsers)).toBe(true);
		expect(isUsers.length).toBeGreaterThan(0);

		console.log('User', isUsers[0]);
	});
});

//*======================================={Users Public Route}==============================================

//*======================================={Bags Public Route}==============================================

describe('Base Bags Route Tests To get All Bags', () => {
	test('Should Get All Bags', async () => {
		await prisma.bags.createMany({
			data: bags,
		});

		const res = await request(app).get('/api/beggy/public/bags');

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Retrieved All Bags');
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeGreaterThan(1);
	});
});

describe('Base Bags Route Tests To Get All Bags By Search', () => {
	test('Should get all Bags by search for Not Enum Fields', async () => {
		await prisma.bags.createMany({
			data: bags,
		});

		const res = await request(app)
			//* search by fields not Enum
			.get(`/api/beggy/public/bags?color=green`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'Successfully Retrieved All Bags By Search'
		);
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeGreaterThan(0);
	});

	test('Should get all Bags by search for Enum Field', async () => {
		await prisma.bags.createMany({
			data: bags,
		});

		const res = await request(app)
			//* search by field Enum
			.get(`/api/beggy/public/bags?type=travel_bag`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'Successfully Retrieved All Bags By Search'
		);
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeGreaterThan(0);
	});
});

describe('Base Bags Route Tests To Get Bag By ID', () => {
	test('Should Get Bag By ID', async () => {
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
			},
		});

		const res = await request(app).get(`/api/beggy/public/bags/${bag.id}`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Retrieved Bag By ID');
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
		});
	});
});

//*======================================={Bags Public Route}==============================================

//*======================================={Items Public Route}==============================================

describe('Base Items Route Tests for get All Items', () => {
	test('Get All Items', async () => {
		await prisma.items.createMany({
			data: items,
		});

		const response = await request(app).get('/api/beggy/public/items');

		console.log('Response', response.body);
		console.log('Response data', response.body.data);

		expect(response.status).toBe(200);
		expect(response.body.success).toBe(true);
		expect(Array.isArray(response.body.data)).toBe(true);
		expect(response.body.data.length).toBeGreaterThan(0);
	});
});

describe('Base Items Route Tests For Get Item By ID', () => {
	test('Should return Item by ID', async () => {
		const item = await prisma.items.create({
			data: {
				name: 'Test Item 1',
				quantity: 100,
				category: 'clothing',
				weight: 1.5,
				volume: 0.05,
				color: 'blue',
			},
		});

		const res = await request(app).get(
			`/api/beggy/public/items/${item.id}`
		);

		console.log('Response', res.body);
		console.log('Response data', res.body.data);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully found item by id');
		expect(res.body.data).toMatchObject({
			id: item.id,
			name: 'Test Item 1',
			quantity: 100,
			category: 'CLOTHING',
			weight: 1.5,
			volume: 0.05,
			color: 'blue',
		});
	});
});

describe('Base Items Route Tests For Search for Items', () => {
	beforeEach(async () => {
		// Create test items once before all tests
		await prisma.items.createMany({
			data: items,
		});
	});

	test('Should return items by search query If there is no Match to the Query', async () => {
		const res = await request(app)
			//* There is no match for color yellow
			.get(`/api/beggy/public/items?color=yellow`);

		console.log('Response Not Match', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully found all items by Search');
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBe(0);
	});

	test('Should return items by search query if there are Match to the search', async () => {
		const res = await request(app)
			//* There is a match for color blue
			.get(`/api/beggy/public/items?field=category&search=electronics`);

		console.log('Response Match for Search', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully found all items by Search');
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeGreaterThan(0);
	});

	test('Should return items by Search and Order and Pagination if there are Match', async () => {
		const res = await request(app).get(
			'/api/beggy/public/items?page=2&limit=4&order=desc&sortBy=volume'
		);

		console.log('Response For Search and Order and Pagination', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully found all items by Search');
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeGreaterThan(0);
	});
});

//*======================================={Items Public Route}==============================================

//*======================================={Suitcase Public Route}==============================================

describe('Base suitcases Route Tests To Get All Suitcases', () => {
	test('Should Get All Suitcases', async () => {
		await prisma.suitcases.createMany({
			data: suitcase,
		});

		const res = await request(app).get('/api/beggy/public/suitcases');

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
			'/api/beggy/public/suitcases?page=2&limit=3&sortBy=weight&order=desc'
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
			.get(`/api/beggy/public/suitcases?features=usb_port`);

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
			`/api/beggy/public/suitcases/${suitcase.id}`
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

//*======================================={Suitcase Public Route}==============================================
