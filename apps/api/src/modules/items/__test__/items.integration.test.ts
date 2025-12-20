import request from 'supertest';
import type { PrismaClient } from '../generated/client/index.js';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { hashingPassword } from '../../utils/hash.js';
import { birthOfDate } from '../../utils/userHelper.js';
import { signToken } from '../../utils/jwt.js';
import { filterQuery } from '../setup.test.js';

let csrfToken;
let csrfSecret;
let cookies;
const items = [
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

describe('Items Route For User to Get Item User Has By ID', () => {
	test('Should get item Belongs To User by ID', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
			},
		});

		const item = await prisma.items.create({
			data: {
				name: 'Test Item',
				quantity: 50,
				category: 'clothing',
				weight: 1.5,
				volume: 0.05,
				color: 'blue',
				userId: user.id,
			},
		});

		const res = await request(app)
			.get(`/api/beggy/items/${item.id}`)
			.set('Cookie', [...cookies, `accessToken=${signToken(user.id)}`]);

		console.log('Response', res.body);
		console.log('Response data', res.body.data);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Found Item User Has By ID');
		expect(res.body.data).toMatchObject({
			id: item.id,
			name: 'Test Item',
			quantity: 50,
			category: 'CLOTHING',
			weight: 1.5,
			volume: 0.05,
			color: 'blue',
		});
	});
});

describe('Should get paginated items of category books Belongs To User', () => {
	let user;
	let token;
	const filter = {
		limit: 10,
		page: 1,
		category: 'books',
	};

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				birth: birthOfDate('2003-06-18'),
			},
		});

		const userBooks = items
			.filter((item) => item.category === filter.category)
			.map((item) => ({ ...item, userId: user.id }));

		await prisma.items.createMany({ data: userBooks });
		token = signToken(user.id);
	});

	test('Should get all items belonging to the user', async () => {
		const res = await request(app)
			.get(`/api/beggy/items`)
			.set('Cookie', [`accessToken=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Found All Items User Has',
		});

		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.every((item) => item.userId === user.id)).toBe(
			true
		);
	});

	test('Should get paginated items belonging to the user, filtered by category', async () => {
		const res = await request(app)
			.get(`/api/beggy/items/?${filterQuery(filter)}`)
			.set('Cookie', [`accessToken=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Found All Items User Has By Search',
		});

		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeLessThanOrEqual(filter.limit);

		for (const item of res.body.data) {
			expect(item.userId).toBe(user.id);
			expect(item.category).toBe(filter.category.toUpperCase());
		}
	});
});

describe('Base Items Route Tests For Search for Items User Has', () => {
	let user;
	let token;
	const filter = {
		limit: 10,
		page: 1,
		category: 'books',
	};

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				birth: birthOfDate('2003-06-18'),
			},
		});

		const userBooks = items
			.filter((item) => item.category === filter.category)
			.map((item) => ({ ...item, userId: user.id }));

		await prisma.items.createMany({ data: userBooks });
		token = signToken(user.id);
	});

	test('Should return items by search query If there is no Match to the Query', async () => {
		const res = await request(app)
			//* There is no match for color yellow
			.get(`/api/beggy/items/?${filterQuery(filter)}`)
			.set('Cookie', [...cookies, `accessToken=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Found All Items User Has By Search',
		});

		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeLessThanOrEqual(filter.limit);

		for (const item of res.body.data) {
			expect(item.userId).toBe(user.id);
			expect(item.category).toBe(filter.category.toUpperCase());
		}
	});

	test('Should return items by search query if there are Match to the search', async () => {
		filter.category = 'electronics';

		const res = await request(app)
			//* There is a match for color blue
			.get(`/api/beggy/items/?${filterQuery(filter)}`)
			.set('Cookie', [...cookies, `accessToken=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Found All Items User Has By Search',
		});

		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeLessThanOrEqual(filter.limit);

		for (const item of res.body.data) {
			expect(item.userId).toBe(user.id);
			expect(item.category).toBe(filter.category.toUpperCase());
		}
	});

	test('Should return items by Search and Order and Pagination if there are Match', async () => {
		filter.category = 'electronics';
		filter.order = 'desc';
		filter.sortBy = 'volume';

		const res = await request(app)
			.get(`/api/beggy/items/?${filterQuery(filter)}`)
			.set('Cookie', [...cookies, `accessToken=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Found All Items User Has By Search',
		});

		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeLessThanOrEqual(filter.limit);

		for (const item of res.body.data) {
			expect(item.userId).toBe(user.id);
			expect(item.category).toBe(filter.category.toUpperCase());
		}
	});
});

describe('Items Route For User To Create Item For User', () => {
	let user;
	let token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				birth: birthOfDate('2003-06-18'),
			},
		});

		token = signToken(user.id);
	});

	test('Should create a new item For User', async () => {
		const res = await request(app)
			.post(`/api/beggy/items/`)
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				name: 'Test Item 1',
				quantity: 50,
				category: 'clothing',
				weight: 1.5,
				volume: 0.05,
				color: 'blue',
			});

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Item Created Successfully For User',
		});

		expect(res.body.data).toMatchObject({
			name: 'Test Item 1',
			quantity: 50,
			category: 'CLOTHING',
			weight: 1.5,
			volume: 0.05,
			color: 'blue',
			userId: user.id,
		});
	});
});

describe('Items Route For User to Create Items For User', () => {
	let user;
	let token;
	let userItems;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				birth: birthOfDate('2003-06-18'),
			},
		});

		userItems = items.filter((_, index) => index < 5);

		token = signToken(user.id);
	});

	test('Should create Items for User', async () => {
		const res = await request(app)
			.post('/api/beggy/items/multiple')
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send(userItems);

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Items Created Successfully For User',
		});
		expect(res.body.data.count).toBe(userItems.length);
	});
});

describe('Items Route For User to Replace an Item User Has', () => {
	let user;
	let token;
	let item;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				birth: birthOfDate('2003-06-18'),
			},
		});

		item = await prisma.items.create({
			data: {
				name: 'Test Item 1',
				quantity: 100,
				category: 'clothing',
				weight: 1.5,
				volume: 0.05,
				color: 'blue',
				userId: user.id,
			},
		});

		token = signToken(user.id);
	});

	test('Should replace an item Belongs To User', async () => {
		const res = await request(app)
			.put(`/api/beggy/items/${item.id}`)
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				name: 'Updated Test Item 1',
				quantity: 50,
				category: 'electronics',
				weight: 0.5,
				volume: 0.01,
				color: 'red',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Replaced Item Belongs to User',
		});

		expect(res.body.data).toMatchObject({
			id: item.id,
			name: 'Updated Test Item 1',
			quantity: 50,
			category: 'ELECTRONICS',
			weight: 0.5,
			volume: 0.01,
			color: 'red',
			userId: user.id,
		});
	});
});

describe('Items Route For User to Modify Item User Has', () => {
	let user;
	let token;
	let item;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				birth: birthOfDate('2003-06-18'),
			},
		});

		item = await prisma.items.create({
			data: {
				name: 'Test Item 1',
				quantity: 100,
				category: 'clothing',
				weight: 1.5,
				volume: 0.05,
				color: 'blue',
				userId: user.id,
			},
		});

		token = signToken(user.id);
	});

	test('Should modify an item Belongs To User', async () => {
		const res = await request(app)
			.patch(`/api/beggy/items/${item.id}`)
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				name: 'Updated Test Item 1',
				category: 'electronics',
				color: 'red',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Modified Item Belongs to User',
		});

		expect(res.body.data).toMatchObject({
			name: 'Updated Test Item 1',
			category: 'ELECTRONICS',
			color: 'red',
			userId: user.id,
		});
	});
});

describe('Items Route For User to Delete Item User Has By ID', () => {
	let user;
	let token;
	let item;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				birth: birthOfDate('2003-06-18'),
			},
		});

		item = await prisma.items.create({
			data: {
				name: 'Test Item 1',
				quantity: 100,
				category: 'clothing',
				weight: 1.5,
				volume: 0.05,
				color: 'blue',
				userId: user.id,
			},
		});

		token = signToken(user.id);
	});

	test('Should delete an item Belongs To User', async () => {
		const res = await request(app)
			.delete(`/api/beggy/items/${item.id}`)
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Deleted Item Belongs to User',
		});

		expect(res.body.data).toMatchObject({
			id: item.id,
			name: 'Test Item 1',
		});
	});
});

describe('Items Route For User To Delete All Items User Has', () => {
	let user;
	let token;
	let userItems;
	const filter = {
		color: 'blue',
	};

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				birth: birthOfDate('2003-06-18'),
			},
		});

		userItems = items
			.filter((item) => item.color === filter.color)
			.map((item) => ({ ...item, userId: user.id }));

		await prisma.items.createMany({ data: userItems });
		token = signToken(user.id);
	});

	test('Should delete all items Belongs To User', async () => {
		const res = await request(app)
			.delete(`/api/beggy/items/`)
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				confirmDelete: true,
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Deleted All Items Belongs to User',
		});

		expect(res.body.data.count).toBe(userItems.length);
	});

	test('Should delete all items Belongs To User', async () => {
		const res = await request(app)
			.delete(`/api/beggy/items/?${filterQuery(filter)}`)
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				confirmDelete: true,
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Deleted All Items Belongs to User By Search',
		});

		expect(res.body.data.count).toBe(userItems.length);
	});
});



//*======================================={Items Public Route}==============================================

describe('Base Items Route Tests for get All Items', () => {
	test('Get All Items', async () => {
		await prisma.items.createMany({
			data: items,
		});

		const response = await request(app).get('/api/beggy/public/items');

		expect(response.status).toBe(200);
		expect(response.body).toMatchObject({
			success: true,
			message: 'Successfully found all items',
		});

		expect(Array.isArray(response.body.data)).toBe(true);
		expect(response.body.data.length).toBe(items.length);
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

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully found item by id',
		});

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
	let myItems;
	const filter = { color: 'yellow', category: 'electronics' };

	beforeEach(async () => {
		// Create test items once before all tests
		myItems = await prisma.items.createMany({
			data: items.filter((i) => {
				return (
					i.color === filter.color && i.category === filter.category
				);
			}),
		});
	});

	test('Should return items by search query if there are Match to the search', async () => {
		const res = await request(app).get(
			`/api/beggy/public/items?${filterQuery(filter)}`
		);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully found all items by Search',
		});

		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBe(myItems.count);
	});

	test('Should return items by Search and Order and Pagination if there are Match', async () => {
		const res = await request(app).get(
			'/api/beggy/public/items?page=2&limit=4&order=desc&sortBy=volume'
		);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully found all items',
		});

		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBe(0);
	});
});

//*======================================={Items Public Route}==============================================



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

