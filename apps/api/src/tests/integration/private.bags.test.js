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
