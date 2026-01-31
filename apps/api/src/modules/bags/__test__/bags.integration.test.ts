// import request from 'supertest';
// import type { PrismaClient } from '../generated/client/index.js';
// import prisma from '../../../prisma/prisma.js';
// import app from '../../../app.js';
// import { hashingPassword } from '../../utils/hash.js';
// import { signToken } from '../../utils/jwt.js';
// import { filterQuery } from '../setup.test.js';

// let csrfToken;
// let csrfSecret;
// let cookies;
// const bags = [
// 	{
// 		name: 'Bag 1',
// 		type: 'laptop_bag',
// 		color: 'green',
// 		size: 'small',
// 		capacity: 11.2,
// 		maxWeight: 12.55,
// 		weight: 1.5,
// 		material: 'nylon',
// 		features: ['usb_port'],
// 	},
// 	{
// 		name: 'Bag 2',
// 		type: 'backpack',
// 		color: 'blue',
// 		size: 'medium',
// 		capacity: 15.3,
// 		maxWeight: 16.88,
// 		weight: 2.2,
// 		material: 'polyester',
// 		features: ['multiple_pockets'],
// 	},
// 	{
// 		name: 'Bag 3',
// 		type: 'travel_bag',
// 		color: 'red',
// 		size: 'large',
// 		capacity: 18.7,
// 		maxWeight: 20.33,
// 		weight: 2.8,
// 		material: 'leather',
// 		features: ['lightweight'],
// 	},
// 	{
// 		name: 'Bag 4',
// 		type: 'duffel',
// 		color: 'yellow',
// 		size: 'extra_large',
// 		capacity: 21.9,
// 		maxWeight: 23.5,
// 		weight: 3.4,
// 		material: 'fabric',
// 		features: ['trolley_sleeve'],
// 	},
// 	{
// 		name: 'Bag 5',
// 		type: 'tote',
// 		color: 'purple',
// 		size: 'small',
// 		capacity: 25.6,
// 		maxWeight: 27.11,
// 		weight: 4.1,
// 		material: 'polyester',
// 		features: ['waterproof'],
// 	},
// 	{
// 		name: 'Bag 6',
// 		type: 'travel_bag',
// 		color: 'pink',
// 		size: 'large',
// 		capacity: 29.8,
// 		maxWeight: 31.33,
// 		weight: 4.7,
// 		material: 'leather',
// 		features: ['waterproof'],
// 	},
// 	{
// 		name: 'Bag 7',
// 		type: 'handbag',
// 		color: 'orange',
// 		size: 'medium',
// 		capacity: 34.2,
// 		maxWeight: 35.77,
// 		weight: 5.3,
// 		material: 'fabric',
// 		features: ['waterproof'],
// 	},
// ];

// beforeAll(async () => {
// 	const response = await request(app).get('/api/beggy/auth/csrf-token');
// 	cookies = response.headers['set-cookie'];
// 	const secret = cookies
// 		.find((cookie) => cookie.startsWith('X-CSRF-Secret='))
// 		.split(';')[0];

// 	csrfSecret = secret.split('=')[1];
// 	csrfToken = response.body.data.csrfToken;
// });

// test('Should return a CSRF token', async () => {
// 	expect(csrfToken).toBeDefined();
// 	expect(csrfSecret).toBeDefined();
// });

// describe('Bags Route For User For Get All Bags Belongs To User', () => {
// 	let user;
// 	let token;
// 	let userBags;
// 	const filter = { features: ['usb_port', 'lightweight'] };

// 	beforeEach(async () => {
// 		user = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Doe',
// 				email: 'user@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'user',
// 			},
// 		});

// 		userBags = bags
// 			.filter((bag) => filter.features.includes(bag.features[0]))
// 			.map((item) => ({ ...item, userId: user.id }));

// 		await prisma.bags.createMany({
// 			data: userBags,
// 		});

// 		token = signToken(user.id);
// 	});

// 	test('Should Get All Bags Belongs To User', async () => {
// 		const res = await request(app)
// 			.get(`/api/beggy/bags/`)
// 			.set('Cookie', [`accessToken=${token}`]);

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: 'Successfully Retrieved Bags User Has',
// 		});

// 		expect(res.body.data.length).toBe(userBags.length);

// 		for (const item of res.body.data) {
// 			expect(item.userId).toBe(user.id);
// 		}
// 	});

// 	test('Should Get All Bags Belongs To User By searching', async () => {
// 		const res = await request(app)
// 			.get(`/api/beggy/bags/?${filterQuery(filter)}`)
// 			.set('Cookie', [`accessToken=${token}`]);

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: 'Successfully Retrieved Bags User Has',
// 		});

// 		expect(Array.isArray(res.body.data)).toBe(true);
// 		expect(res.body.data.length).toBeLessThanOrEqual(userBags.length);

// 		for (const item of res.body.data) {
// 			expect(item.userId).toBe(user.id);
// 			const upperFeatures = filter.features.map((f) => f.toUpperCase());
// 			item.features.forEach((f) => {
// 				expect(upperFeatures).toContain(f);
// 			});
// 		}
// 	});
// });

// describe('Bags Route For User For Get User Bag By Its ID', () => {
// 	let user;
// 	let token;
// 	let bag;

// 	beforeEach(async () => {
// 		user = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Doe',
// 				email: 'user@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'user',
// 			},
// 		});

// 		bag = await prisma.bags.create({
// 			data: {
// 				name: 'Test Bag 1',
// 				type: 'laptop_bag',
// 				color: 'green',
// 				size: 'small',
// 				capacity: 11.2,
// 				maxWeight: 12.55,
// 				weight: 1.5,
// 				material: 'nylon',
// 				features: ['usb_port'],
// 				userId: user.id,
// 			},
// 		});

// 		token = signToken(user.id);
// 	});

// 	test('Should Get User Bag By Its ID', async () => {
// 		const res = await request(app)
// 			.get(`/api/beggy/bags/${bag.id}`)
// 			.set('Cookie', [`accessToken=${token}`]);

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: 'Successfully Retrieved Bag User Has',
// 		});

// 		expect(res.body.data).toMatchObject({
// 			id: bag.id,
// 			name: 'Test Bag 1',
// 			type: 'LAPTOP_BAG',
// 			color: 'green',
// 			size: 'SMALL',
// 			capacity: 11.2,
// 			maxWeight: 12.55,
// 			weight: 1.5,
// 			material: 'NYLON',
// 			features: ['USB_PORT'],
// 			userId: user.id,
// 		});
// 	});
// });

// describe('Bags Route For User For Create Bag For User', () => {
// 	let user;
// 	let token;

// 	beforeEach(async () => {
// 		user = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Doe',
// 				email: 'user@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'user',
// 			},
// 		});

// 		token = signToken(user.id);
// 	});

// 	test('Should Create Bag For User', async () => {
// 		const res = await request(app)
// 			.post(`/api/beggy/bags/`)
// 			.set('Cookie', [...cookies, `accessToken=${token}`])
// 			.set('X-CSRF-Secret', csrfSecret)
// 			.set('x-csrf-token', csrfToken)
// 			.send({
// 				name: 'Test Bag 1',
// 				type: 'laptop_bag',
// 				color: 'green',
// 				size: 'small',
// 				capacity: 11.2,
// 				maxWeight: 12.55,
// 				weight: 1.5,
// 				material: 'nylon',
// 				features: ['usb_port'],
// 			});

// 		expect(res.status).toBe(201);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: 'Successfully Created Bag For User',
// 		});

// 		expect(res.body.data).toMatchObject({
// 			name: 'Test Bag 1',
// 			type: 'LAPTOP_BAG',
// 			color: 'green',
// 			size: 'SMALL',
// 			capacity: 11.2,
// 			maxWeight: 12.55,
// 			weight: 1.5,
// 			material: 'NYLON',
// 			features: ['USB_PORT'],
// 			userId: user.id,
// 		});
// 	});
// });

// describe("Bags Route For User For Replace User's Bag", () => {
// 	let user;
// 	let token;
// 	let bag;

// 	beforeEach(async () => {
// 		user = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Doe',
// 				email: 'user@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'user',
// 			},
// 		});

// 		bag = await prisma.bags.create({
// 			data: {
// 				name: 'Test Bag 1',
// 				type: 'laptop_bag',
// 				color: 'green',
// 				size: 'small',
// 				capacity: 11.2,
// 				maxWeight: 12.55,
// 				weight: 1.5,
// 				material: 'nylon',
// 				features: ['usb_port'],
// 				userId: user.id,
// 			},
// 		});

// 		token = signToken(user.id);
// 	});

// 	test("Should Replace User's Bag", async () => {
// 		const res = await request(app)
// 			.put(`/api/beggy/bags/${bag.id}`)
// 			.set('Cookie', [...cookies, `accessToken=${token}`])
// 			.set('X-CSRF-Secret', csrfSecret)
// 			.set('x-csrf-token', csrfToken)
// 			.send({
// 				name: 'Updated Test Bag 1',
// 				type: 'backpack',
// 				color: 'blue',
// 				size: 'medium',
// 				capacity: 15.2,
// 				maxWeight: 17.55,
// 				weight: 2.5,
// 				material: 'leather',
// 				features: ['waterproof', 'expandable'],
// 			});

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: "Successfully Replace User's Bag",
// 		});

// 		expect(res.body.data).toMatchObject({
// 			name: 'Updated Test Bag 1',
// 			type: 'BACKPACK',
// 			color: 'blue',
// 			size: 'MEDIUM',
// 			capacity: 15.2,
// 			maxWeight: 17.55,
// 			weight: 2.5,
// 			material: 'LEATHER',
// 			features: ['WATERPROOF', 'EXPANDABLE'],
// 		});
// 	});
// });

// describe("Bags Route For User For Modify User's Bag", () => {
// 	let user;
// 	let token;
// 	let bag;

// 	beforeEach(async () => {
// 		user = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Doe',
// 				email: 'user@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'user',
// 			},
// 		});

// 		bag = await prisma.bags.create({
// 			data: {
// 				name: 'Test Bag 1',
// 				type: 'laptop_bag',
// 				color: 'green',
// 				size: 'small',
// 				capacity: 11.2,
// 				maxWeight: 12.55,
// 				weight: 1.5,
// 				material: 'nylon',
// 				features: [
// 					'usb_port',
// 					'anti_theft',
// 					'multiple_pockets',
// 					'waterproof',
// 				],
// 				userId: user.id,
// 			},
// 		});

// 		token = signToken(user.id);
// 	});

// 	test("Should Modify User's Bag", async () => {
// 		const res = await request(app)
// 			.patch(`/api/beggy/bags/${bag.id}`)
// 			.set('Cookie', [...cookies, `accessToken=${token}`])
// 			.set('X-CSRF-Secret', csrfSecret)
// 			.set('x-csrf-token', csrfToken)
// 			.send({
// 				material: 'leather',
// 				features: ['waterproof', 'expandable'],
// 				removeFeatures: ['usb_port', 'multiple_pockets'],
// 			});

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: "Successfully Modified User's Bag",
// 		});

// 		expect(res.body.data).toMatchObject({
// 			material: 'LEATHER',
// 			features: ['WATERPROOF', 'EXPANDABLE', 'ANTI_THEFT'],
// 		});
// 	});
// });

// describe("Bags Route For User For Delete User's Bags By ID", () => {
// 	let user;
// 	let token;
// 	let bag;

// 	beforeEach(async () => {
// 		user = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Doe',
// 				email: 'user@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'user',
// 			},
// 		});

// 		bag = await prisma.bags.create({
// 			data: {
// 				name: 'Test Bag 1',
// 				type: 'laptop_bag',
// 				color: 'green',
// 				size: 'small',
// 				capacity: 11.2,
// 				maxWeight: 12.55,
// 				weight: 1.5,
// 				material: 'nylon',
// 				features: [
// 					'usb_port',
// 					'anti_theft',
// 					'multiple_pockets',
// 					'waterproof',
// 				],
// 				userId: user.id,
// 			},
// 		});

// 		token = signToken(user.id);
// 	});

// 	test("Should Delete User's Bag By ID", async () => {
// 		const res = await request(app)
// 			.delete(`/api/beggy/bags/${bag.id}`)
// 			.set('Cookie', [...cookies, `accessToken=${token}`])
// 			.set('X-CSRF-Secret', csrfSecret)
// 			.set('x-csrf-token', csrfToken);

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: "Successfully Deleted User's Bag",
// 		});

// 		expect(res.body.data).toMatchObject({
// 			id: bag.id,
// 			name: 'Test Bag 1',
// 		});
// 	});
// });

// describe("Bags Route For User For Delete All User's Bags", () => {
// 	let user;
// 	let token;
// 	let userBags;
// 	const filter = { material: 'nylon' };

// 	beforeEach(async () => {
// 		user = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Doe',
// 				email: 'user@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'user',
// 			},
// 		});

// 		userBags = bags
// 			.filter((bag) => bag.material === filter.material)
// 			.map((item) => ({ ...item, userId: user.id }));

// 		await prisma.bags.createMany({
// 			data: userBags,
// 		});

// 		token = signToken(user.id);
// 	});

// 	test("Should Delete All User's Bags", async () => {
// 		const res = await request(app)
// 			.delete(`/api/beggy/bags/`)
// 			.set('Cookie', [...cookies, `accessToken=${token}`])
// 			.set('X-CSRF-Secret', csrfSecret)
// 			.set('x-csrf-token', csrfToken)
// 			.send({
// 				confirmDelete: true,
// 			});

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: "Successfully Deleted All User's Bags",
// 		});

// 		expect(res.body.data.count).toBe(userBags.length);
// 	});

// 	test("Should Delete All User's Bags By Search", async () => {
// 		const res = await request(app)
// 			.delete(`/api/beggy/bags/?${filterQuery(filter)}`)
// 			.set('Cookie', [...cookies, `accessToken=${token}`])
// 			.set('X-CSRF-Secret', csrfSecret)
// 			.set('x-csrf-token', csrfToken)
// 			.send({
// 				confirmDelete: true,
// 			});

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: "Successfully Deleted All User's Bags By Search Filter",
// 		});

// 		expect(res.body.data.count).toBe(userBags.length);
// 	});
// });

// //*======================================={Bags Public Route}==============================================

// describe('Base Bags Route Tests To get All Bags', () => {
// 	beforeEach(async () => {
// 		await prisma.bags.createMany({
// 			data: bags,
// 		});
// 	});

// 	test('Should Get All Bags', async () => {
// 		const res = await request(app).get('/api/beggy/public/bags');

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: 'Successfully Retrieved All Bags',
// 		});

// 		expect(Array.isArray(res.body.data)).toBe(true);
// 		expect(res.body.data.length).toBe(bags.length);
// 	});
// });

// describe('Base Bags Route Tests To Get All Bags By Search', () => {
// 	let myBags;
// 	const filter = { color: 'green', type: 'travel_bag' };

// 	beforeEach(async () => {
// 		myBags = await prisma.bags.createMany({
// 			data: bags.filter((b) => {
// 				return b.color === filter.color && b.type === filter.type;
// 			}),
// 		});
// 	});

// 	test('Should get all Bags by search for Not Enum Fields', async () => {
// 		const res = await request(app)
// 			//* search by fields not Enum
// 			.get(`/api/beggy/public/bags?${filterQuery(filter)}`);

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: 'Successfully Retrieved All Bags By Search',
// 		});

// 		expect(Array.isArray(res.body.data)).toBe(true);
// 		expect(res.body.data.length).toBe(myBags.count);
// 	});
// });

// describe('Base Bags Route Tests To Get Bag By ID', () => {
// 	let bag;

// 	beforeEach(async () => {
// 		bag = await prisma.bags.create({
// 			data: {
// 				name: 'Test Bag 1',
// 				type: 'laptop_bag',
// 				color: 'green',
// 				size: 'small',
// 				capacity: 11.2,
// 				maxWeight: 12.55,
// 				weight: 1.5,
// 				material: 'nylon',
// 				features: ['usb_port'],
// 			},
// 		});
// 	});

// 	test('Should Get Bag By ID', async () => {
// 		const res = await request(app).get(`/api/beggy/public/bags/${bag.id}`);

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: 'Successfully Retrieved Bag By ID',
// 		});

// 		expect(res.body.data).toMatchObject({
// 			id: bag.id,
// 			name: 'Test Bag 1',
// 			type: 'LAPTOP_BAG',
// 			color: 'green',
// 			size: 'SMALL',
// 			capacity: 11.2,
// 			maxWeight: 12.55,
// 			weight: 1.5,
// 			material: 'NYLON',
// 			features: ['USB_PORT'],
// 		});
// 	});
// });

// //*======================================={Bags Public Route}==============================================

// //*======================================={Bags Private Route}==============================================

// describe('Base Bags Route Tests To Replace Bag By ID For Admin and Member', () => {
// 	let admin, bag, token;

// 	beforeEach(async () => {
// 		admin = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Don',
// 				email: 'admin@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'admin',
// 			},
// 		});

// 		bag = await prisma.bags.create({
// 			data: {
// 				name: 'Test Bag 1',
// 				type: 'laptop_bag',
// 				color: 'green',
// 				size: 'small',
// 				capacity: 11.2,
// 				maxWeight: 12.55,
// 				weight: 1.5,
// 				material: 'nylon',
// 				features: ['usb_port'],
// 			},
// 		});

// 		token = signToken(admin.id);
// 	});

// 	test('Should Replace Bag By ID as Admin', async () => {
// 		const res = await request(app)
// 			.put(`/api/beggy/private/bags/${bag.id}`)
// 			.set('Cookie', cookies)
// 			.set('X-CSRF-Secret', csrfSecret)
// 			.set('x-csrf-token', csrfToken)
// 			.set('Authorization', `Bearer ${token}`)
// 			.send({
// 				name: 'Test Bag 1 Updated',
// 				type: 'travel_bag',
// 				color: 'blue',
// 				size: 'medium',
// 				capacity: 13.5,
// 				maxWeight: 14.88,
// 				weight: 2.1,
// 				material: 'polyester',
// 				features: ['multiple_pockets'],
// 			});

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: 'Successfully Replaced Bag By ID',
// 		});

// 		expect(res.body.data).toMatchObject({
// 			id: bag.id,
// 			name: 'Test Bag 1 Updated',
// 			type: 'TRAVEL_BAG',
// 			color: 'blue',
// 			size: 'MEDIUM',
// 			capacity: 13.5,
// 			maxWeight: 14.88,
// 			weight: 2.1,
// 			material: 'POLYESTER',
// 			features: ['MULTIPLE_POCKETS'],
// 		});
// 	});
// });

// describe('Base Bags Route Tests To Modify Bag By ID For Admin and Member', () => {
// 	let member, bag, token;

// 	beforeEach(async () => {
// 		member = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Don',
// 				email: 'member@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'member',
// 			},
// 		});

// 		bag = await prisma.bags.create({
// 			data: {
// 				name: 'Test Bag 1',
// 				type: 'laptop_bag',
// 				color: 'green',
// 				size: 'small',
// 				capacity: 11.2,
// 				maxWeight: 12.55,
// 				weight: 1.5,
// 				material: 'nylon',
// 				features: ['usb_port'],
// 			},
// 		});

// 		token = signToken(member.id);
// 	});

// 	test('Should Modify Bag By ID as Member', async () => {
// 		const res = await request(app)
// 			.patch(`/api/beggy/private/bags/${bag.id}`)
// 			.set('Cookie', cookies)
// 			.set('X-CSRF-Secret', csrfSecret)
// 			.set('x-csrf-token', csrfToken)
// 			.set('Authorization', `Bearer ${token}`)
// 			.send({
// 				type: 'travel_bag',
// 				size: 'medium',
// 				material: 'polyester',
// 				features: ['multiple_pockets'],
// 			});

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: 'Successfully Modifying Bag By ID',
// 		});

// 		expect(res.body.data).toMatchObject({
// 			id: bag.id,
// 			type: 'TRAVEL_BAG',
// 			size: 'MEDIUM',
// 			material: 'POLYESTER',
// 			features: ['MULTIPLE_POCKETS'],
// 		});
// 	});
// });

// describe('Base Bags Route Tests To Delete Bag By ID For Admin and Member', () => {
// 	let admin, bag, token;

// 	beforeEach(async () => {
// 		admin = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Don',
// 				email: 'admin@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'admin',
// 			},
// 		});

// 		bag = await prisma.bags.create({
// 			data: {
// 				name: 'Test Bag 1',
// 				type: 'laptop_bag',
// 				color: 'green',
// 				size: 'small',
// 				capacity: 11.2,
// 				maxWeight: 12.55,
// 				weight: 1.5,
// 				material: 'nylon',
// 				features: ['usb_port'],
// 			},
// 		});

// 		token = signToken(admin.id);
// 	});

// 	test('Should Delete Bag By ID as Admin', async () => {
// 		const res = await request(app)
// 			.delete(`/api/beggy/private/bags/${bag.id}`)
// 			.set('Cookie', cookies)
// 			.set('X-CSRF-Secret', csrfSecret)
// 			.set('x-csrf-token', csrfToken)
// 			.set('Authorization', `Bearer ${token}`);

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: 'Successfully Deleted Bag By ID',
// 		});

// 		expect(res.body.data).toMatchObject({
// 			id: bag.id,
// 			name: 'Test Bag 1',
// 		});
// 	});
// });

// describe('Base Bags Route Tests To Delete All Bags From DB For Only Admin', () => {
// 	let admin, token;
// 	const filter = { size: 'small' };

// 	beforeEach(async () => {
// 		admin = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Doe',
// 				email: 'admin@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'admin',
// 			},
// 		});

// 		token = signToken(admin.id);
// 	});

// 	test('Should Delete All Bags As Admin', async () => {
// 		await prisma.bags.createMany({
// 			data: bags,
// 		});

// 		const res = await request(app)
// 			.delete(`/api/beggy/private/bags`)
// 			.set('Cookie', cookies)
// 			.set('X-CSRF-Secret', csrfSecret)
// 			.set('x-csrf-token', csrfToken)
// 			.set('Authorization', `Bearer ${token}`)
// 			.send({
// 				confirmDelete: true,
// 			});

// 		console.log(res.body);

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: 'Successfully Delete All Bags',
// 		});

// 		expect(res.body.data.count).toBe(bags.length);
// 	});

// 	test('Should Delete Bags By Search as Admin', async () => {
// 		const myBags = await prisma.bags.createMany({
// 			data: bags.filter((b) => b.size === filter.size),
// 		});

// 		const res = await request(app)
// 			.delete(`/api/beggy/private/bags?${filterQuery(filter)}`)
// 			.set('Cookie', cookies)
// 			.set('X-CSRF-Secret', csrfSecret)
// 			.set('x-csrf-token', csrfToken)
// 			.set('Authorization', `Bearer ${signToken(admin.id)}`)
// 			.send({
// 				confirmDelete: true,
// 			});

// 		expect(res.status).toBe(200);
// 		expect(res.body).toMatchObject({
// 			success: true,
// 			message: 'Successfully Delete All Bags By Search',
// 		});

// 		expect(res.body.meta.totalDelete).toBe(myBags.count);
// 	});
// });

// //*======================================={Bags Private Route}==============================================
