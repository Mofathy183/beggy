import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { signToken } from '../../utils/jwt.js';
import { hashingPassword } from '../../utils/hash.js';
import { filterQuery } from '../setup.test.js';

let csrfToken;
let csrfSecret;
let cookies;

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

//*======================================={Items Private Route}==============================================

describe('Base Items Route Tests For Replace By ID For Admin and Member Only', () => {
	let admin, item, token;

	beforeEach(async () => {
		item = await prisma.items.create({
			data: {
				name: 'Test Item',
				quantity: 100,
				category: 'clothing',
				weight: 1.5,
				volume: 0.05,
				color: 'blue',
			},
		});

		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				role: 'admin',
			},
		});

		token = signToken(admin.id);
	});

	test('Should replace items by ID', async () => {
		const res = await request(app)
			.put(`/api/beggy/private/items/${item.id}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				name: 'Updated-Test Item 1',
				quantity: 150,
				category: 'electronics',
				weight: 2,
				volume: 0.1,
				color: 'red',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Replaced Item by ID',
		});

		expect(res.body.data).toMatchObject({
			id: item.id,
			name: 'Updated-Test Item 1',
			quantity: 150,
			category: 'ELECTRONICS',
			weight: 2,
			volume: 0.1,
			color: 'red',
		});
	});
});

describe('Base Item Route Tests For Modify Item For Admin and Member Only', () => {
	let admin, item, token;

	beforeEach(async () => {
		item = await prisma.items.create({
			data: {
				name: 'Test Item',
				quantity: 100,
				category: 'clothing',
				weight: 1.5,
				volume: 0.05,
				color: 'blue',
			},
		});

		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				role: 'admin',
			},
		});

		token = signToken(admin.id);
	});

	test('Should modify the item By ID', async () => {
		const res = await request(app)
			.patch(`/api/beggy/private/items/${item.id}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				quantity: 200,
				color: 'green',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Modified Item by ID',
		});

		expect(res.body.data).toMatchObject({
			id: item.id,
			name: 'Test Item',
			quantity: 200,
			category: 'CLOTHING',
			weight: 1.5,
			volume: 0.05,
			color: 'green',
		});
	});
});

describe('Base Items Route Tests For Deleted Item By ID for Admin and Member Only', () => {
	let admin, item, token;

	beforeEach(async () => {
		item = await prisma.items.create({
			data: {
				name: 'Test Item',
				quantity: 100,
				category: 'clothing',
				weight: 1.5,
				volume: 0.05,
				color: 'blue',
			},
		});

		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				role: 'admin',
			},
		});

		token = signToken(admin.id);
	});

	test('Should delete the item By ID', async () => {
		const res = await request(app)
			.delete(`/api/beggy/private/items/${item.id}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Deleted Item by ID',
		});

		expect(res.body.data).toMatchObject({
			id: item.id,
			name: 'Test Item',
		});
	});
});

describe('Base Items Route Tests For Delete All Items for Admin Only', () => {
	let admin, token;
	const filter = { category: 'books' };

	beforeEach(async () => {
		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				role: 'admin',
			},
		});

		token = signToken(admin.id);
	});

	test('Should delete all items', async () => {
		await prisma.items.createMany({
			data: items,
		});

		const res = await request(app)
			.delete(`/api/beggy/private/items`)
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
			message: 'Successfully Delete All Items',
		});

		expect(res.body.meta.totalDelete).toBe(items.length);
	});

	test('Should delete all items By Search', async () => {
		const myItems = await prisma.items.createMany({
			data: items.filter((i) => i.category === filter.category),
		});

		const res = await request(app)
			.delete(`/api/beggy/private/items?${filterQuery(filter)}`)
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
			message: 'Successfully Delete All Items By Search',
		});

		expect(res.body.meta.totalDelete).toBe(myItems.count);
	});
});

//*======================================={Items Private Route}==============================================
