import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { signToken } from '../../utils/jwt.js';
import { hashingPassword } from '../../utils/hash.js';
import { filterQuery } from '../setup.test.js';

let csrfToken;
let csrfSecret;
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

//*======================================={Bags Private Route}==============================================

describe('Base Bags Route Tests To Replace Bag By ID For Admin and Member', () => {
	let admin, bag, token;

	beforeEach(async () => {
		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Don',
				email: 'admin@example.com',
				password: await hashingPassword('password$1155'),
				role: 'admin',
			},
		});

		bag = await prisma.bags.create({
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

		token = signToken(admin.id);
	});

	test('Should Replace Bag By ID as Admin', async () => {
		const res = await request(app)
			.put(`/api/beggy/private/bags/${bag.id}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				name: 'Test Bag 1 Updated',
				type: 'travel_bag',
				color: 'blue',
				size: 'medium',
				capacity: 13.5,
				maxWeight: 14.88,
				weight: 2.1,
				material: 'polyester',
				features: ['multiple_pockets'],
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Replaced Bag By ID',
		});

		expect(res.body.data).toMatchObject({
			id: bag.id,
			name: 'Test Bag 1 Updated',
			type: 'TRAVEL_BAG',
			color: 'blue',
			size: 'MEDIUM',
			capacity: 13.5,
			maxWeight: 14.88,
			weight: 2.1,
			material: 'POLYESTER',
			features: ['MULTIPLE_POCKETS'],
		});
	});
});

describe('Base Bags Route Tests To Modify Bag By ID For Admin and Member', () => {
	let member, bag, token;

	beforeEach(async () => {
		member = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Don',
				email: 'member@example.com',
				password: await hashingPassword('password$1155'),
				role: 'member',
			},
		});

		bag = await prisma.bags.create({
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

		token = signToken(member.id);
	});

	test('Should Modify Bag By ID as Member', async () => {
		const res = await request(app)
			.patch(`/api/beggy/private/bags/${bag.id}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				type: 'travel_bag',
				size: 'medium',
				material: 'polyester',
				features: ['multiple_pockets'],
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Modifying Bag By ID',
		});

		expect(res.body.data).toMatchObject({
			id: bag.id,
			type: 'TRAVEL_BAG',
			size: 'MEDIUM',
			material: 'POLYESTER',
			features: ['MULTIPLE_POCKETS'],
		});
	});
});

describe('Base Bags Route Tests To Delete Bag By ID For Admin and Member', () => {
	let admin, bag, token;

	beforeEach(async () => {
		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Don',
				email: 'admin@example.com',
				password: await hashingPassword('password$1155'),
				role: 'admin',
			},
		});

		bag = await prisma.bags.create({
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

		token = signToken(admin.id);
	});

	test('Should Delete Bag By ID as Admin', async () => {
		const res = await request(app)
			.delete(`/api/beggy/private/bags/${bag.id}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Deleted Bag By ID',
		});

		expect(res.body.data).toMatchObject({
			id: bag.id,
			name: 'Test Bag 1',
		});
	});
});

describe('Base Bags Route Tests To Delete All Bags From DB For Only Admin', () => {
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

	test('Should Delete All Bags As Admin', async () => {
		await prisma.bags.createMany({
			data: bags,
		});

		const res = await request(app)
			.delete(`/api/beggy/private/bags`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				confirmDelete: true,
			});

		console.log(res.body);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Delete All Bags',
		});

		expect(res.body.data.count).toBe(bags.length);
	});

	test('Should Delete Bags By Search as Admin', async () => {
		const myBags = await prisma.bags.createMany({
			data: bags.filter((b) => b.size === filter.size),
		});

		const res = await request(app)
			.delete(`/api/beggy/private/bags?${filterQuery(filter)}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`)
			.send({
				confirmDelete: true,
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Delete All Bags By Search',
		});

		expect(res.body.meta.totalDelete).toBe(myBags.count);
	});
});

//*======================================={Bags Private Route}==============================================

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
