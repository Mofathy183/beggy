import request from 'supertest';
import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import { signToken } from '../../utils/jwt.js';
import { hashingPassword } from '../../utils/hash.js';

let csrfToken;
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
	csrfToken = response.body.data.csrfToken;
});

test('Should return a CSRF token', async () => {
	expect(csrfToken).toBeDefined();
});

//*======================================={Bags Private Route}==============================================

// describe('Base Bags Route Tests To Replace Bag By ID For Admin and Member', () => {
// 	test('Should Replace Bag By ID as Admin', async () => {
// 		const bag = await prisma.bags.create({
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

// 		const admin = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Don',
// 				email: 'admin@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'admin',
// 			},
// 		});

// 		const res = await request(app)
// 			.put(`/api/beggy/private/bags/${bag.id}`)
// 			.set('Cookie', cookies)
// 			.set('X-XSRF-TOKEN', csrfToken)
// 			.set('Authorization', `Bearer ${signToken(admin.id)}`)
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

// 		console.log('Response', res.body);

// 		expect(res.status).toBe(200);
// 		expect(res.body.success).toBe(true);
// 		expect(res.body.message).toBe('Successfully Replaced Bag By ID');
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

// 		const updatedBag = await prisma.bags.findUnique({
// 			where: {
// 				id: bag.id,
// 			},
// 		});

// 		expect(updatedBag).toMatchObject({
// 			id: updatedBag.id,
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
// 	test('Should Modify Bag By ID as Member', async () => {
// 		const bag = await prisma.bags.create({
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

// 		const member = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Doe',
// 				email: 'member@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'member',
// 			},
// 		});

// 		const res = await request(app)
// 			.patch(`/api/beggy/private/bags/${bag.id}`)
// 			.set('Cookie', cookies)
// 			.set('X-XSRF-TOKEN', csrfToken)
// 			.set('Authorization', `Bearer ${signToken(member.id)}`)
// 			.send({
// 				type: 'travel_bag',
// 				size: 'medium',
// 				material: 'polyester',
// 				features: ['multiple_pockets'],
// 			});

// 		console.log('Response', res.body);

// 		expect(res.status).toBe(200);
// 		expect(res.body.success).toBe(true);
// 		expect(res.body.message).toBe('Successfully Replaced Bag By ID');
// 		expect(res.body.data).toMatchObject({
// 			id: bag.id,
// 			type: 'TRAVEL_BAG',
// 			size: 'MEDIUM',
// 			material: 'POLYESTER',
// 			features: ['MULTIPLE_POCKETS'],
// 		});

// 		const updatedBag = await prisma.bags.findUnique({
// 			where: {
// 				id: bag.id,
// 			},
// 		});

// 		expect(updatedBag).toMatchObject({
// 			id: updatedBag.id,
// 			type: 'TRAVEL_BAG',
// 			size: 'MEDIUM',
// 			material: 'POLYESTER',
// 			features: ['MULTIPLE_POCKETS'],
// 		});
// 	});
// });

// describe('Base Bags Route Tests To Delete Bag By ID For Admin and Member', () => {
// 	test('Should Delete Bag By ID as Admin', async () => {
// 		const bag = await prisma.bags.create({
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

// 		const admin = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Doe',
// 				email: 'admin@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'admin',
// 			},
// 		});

// 		const res = await request(app)
// 			.delete(`/api/beggy/private/bags/${bag.id}`)
// 			.set('Cookie', cookies)
// 			.set('X-XSRF-TOKEN', csrfToken)
// 			.set('Authorization', `Bearer ${signToken(admin.id)}`);

// 		console.log('Response', res.body);

// 		expect(res.status).toBe(200);
// 		expect(res.body.success).toBe(true);
// 		expect(res.body.message).toBe('Successfully Deleted Bag By ID');
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

// 		const deletedBag = await prisma.bags.findUnique({
// 			where: {
// 				id: bag.id,
// 			},
// 		});

// 		expect(deletedBag).toBeNull();
// 	});
// });

// describe('Base Bags Route Tests To Delete All Bags From DB For Only Admin', () => {
// 	test('Should Delete All Bags As Admin', async () => {
// 		await prisma.bags.createMany({
// 			data: bags,
// 		});

// 		const admin = await prisma.user.create({
// 			data: {
// 				firstName: 'John',
// 				lastName: 'Doe',
// 				email: 'admin@example.com',
// 				password: await hashingPassword('password$1155'),
// 				role: 'admin',
// 			},
// 		});

// 		const res = await request(app)
// 			.delete(`/api/beggy/private/bags`)
// 			.set('Cookie', cookies)
// 			.set('X-XSRF-TOKEN', csrfToken)
// 			.set('Authorization', `Bearer ${signToken(admin.id)}`)
// 			.send({
// 				confirmDelete: true,
// 			});

// 		console.log('Response', res.body);

// 		expect(res.status).toBe(200);
// 		expect(res.body.success).toBe(true);
// 		expect(res.body.message).toBe('Successfully Delete All Bags');

// 		const findBags = await prisma.bags.findMany();

// 		expect(findBags).toHaveLength(0);
// 	});

//     test("Should Delete Bags By Search as Admin", async () => {
//         await prisma.bags.createMany({
//             data: bags,
//         });

//         const admin = await prisma.user.create({
//             data: {
//                 firstName: 'John',
//                 lastName: 'Doe',
//                 email: 'admin@example.com',
//                 password: await hashingPassword('password$1155'),
//                 role: 'admin',
//             },
//         });

//         const res = await request(app)
//         .delete(`/api/beggy/private/bags?field=size&search=small`)
//         .set('Cookie', cookies)
//         .set('X-XSRF-TOKEN', csrfToken)
//         .set('Authorization', `Bearer ${signToken(admin.id)}`)
//         .send({
//             confirmDelete: true,
//         });

//         console.log('Response', res.body);

//         expect(res.status).toBe(200);
//         expect(res.body.success).toBe(true);
//         expect(res.body.message).toBe('Successfully Delete All Bags By Search');
//         expect(res.body.meta.totalDelete).toBe(2);

//         const findBags = await prisma.bags.findMany({
//             where: {
//                 size:'SMALL',
//             },
//         });

//         expect(findBags).toHaveLength(0);
//     })
// });

// //*======================================={Bags Private Route}==============================================

// //*======================================={Suitcase Private Route}==============================================

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
			.put(`/api/beggy/private/suitcases/${suitcase.id}`)
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
			.patch(`/api/beggy/private/suitcases/${suitcase.id}`)
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
			.delete(`/api/beggy/private/suitcases/${suitcase.id}`)
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
			.delete(`/api/beggy/private/suitcases`)
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

	test('Should Delete Suitcase By Search For Admin', async () => {
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
			.delete(`/api/beggy/private/suitcases?field=size&search=small`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`)
			.send({
				confirmDelete: true,
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'Successfully Delete All Suitcases By Search'
		);
		expect(res.body.meta.totalDelete).toBe(2);
	});
});

//*======================================={Suitcase Private Route}==============================================

//*======================================={Items Private Route}==============================================

describe('Base Items Route Tests For Replace By ID For Admin and Member Only', () => {
	test('Should replace items by ID', async () => {
		const item = await prisma.items.create({
			data: {
				name: 'Test Item',
				quantity: 100,
				category: 'clothing',
				weight: 1.5,
				volume: 0.05,
				color: 'blue',
			},
		});

		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				role: 'admin',
			},
		});

		const res = await request(app)
			.put(`/api/beggy/private/items/${item.id}`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`)
			.send({
				name: 'Updated-Test Item 1',
				quantity: 150,
				category: 'electronics',
				weight: 2,
				volume: 0.1,
				color: 'red',
			});

		console.log('Response', res.body);
		console.log('Response data', res.body.data);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Replaced Item by ID');
		expect(res.body.data).toMatchObject({
			id: item.id,
			name: 'Updated-Test Item 1',
			quantity: 150,
			category: 'ELECTRONICS',
			weight: 2,
			volume: 0.1,
			color: 'red',
		});

		const updatedItem = await prisma.items.delete({
			where: {
				id: item.id,
			},
		});

		console.log('Updated Item', updatedItem);

		expect(updatedItem).not.toBeNull();
		expect(updatedItem).toMatchObject({
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
	test('Should modify the item By ID', async () => {
		const item = await prisma.items.create({
			data: {
				name: 'Test Item',
				quantity: 50,
				category: 'clothing',
				weight: 1.5,
				volume: 0.05,
				color: 'blue',
			},
		});

		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				role: 'admin',
			},
		});

		const res = await request(app)
			.patch(`/api/beggy/private/items/${item.id}`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`)
			.send({
				quantity: 200,
				color: 'green',
			});

		console.log('Response', res.body);
		console.log('Response data', res.body.data);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Modified Item by ID');
		expect(res.body.data).toMatchObject({
			id: item.id,
			name: 'Test Item',
			quantity: 200,
			category: 'CLOTHING',
			weight: 1.5,
			volume: 0.05,
			color: 'green',
		});

		const updatedItem = await prisma.items.delete({
			where: {
				id: item.id,
			},
		});

		console.log('Updated Item', updatedItem);

		expect(updatedItem).not.toBeNull();
		expect(updatedItem).toMatchObject({
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
	test('Should delete the item By ID', async () => {
		const item = await prisma.items.create({
			data: {
				name: 'Test Item',
				quantity: 50,
				category: 'clothing',
				weight: 1.5,
				volume: 0.05,
				color: 'blue',
			},
		});

		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				role: 'admin',
			},
		});

		const res = await request(app)
			.delete(`/api/beggy/private/items/${item.id}`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`);

		console.log('Response', res.body);
		console.log('Response data', res.body.data);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Deleted Item by ID');
		expect(res.body.data).toMatchObject({
			id: item.id,
			name: 'Test Item',
			quantity: 50,
			category: 'CLOTHING',
			weight: 1.5,
			volume: 0.05,
			color: 'blue',
		});

		const deletedItem = await prisma.items.findUnique({
			where: {
				id: item.id,
			},
		});

		console.log('Deleted Item', deletedItem);

		expect(deletedItem).toBeNull();
	});
});

describe('Base Items Route Tests For Delete All Items for Admin Only', () => {
	test('Should delete all items', async () => {
		await prisma.items.createMany({
			data: items,
		});

		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				role: 'admin',
			},
		});

		const res = await request(app)
			.delete(`/api/beggy/private/items`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`)
			.send({
				confirmDelete: true,
			});

		console.log('Response', res.body);
		console.log('Response data', res.body.data);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Successfully Delete All Items');
		// expect(res.body.data).toBe(null);

		const deletedItems = await prisma.items.findMany();

		console.log('Deleted Items', deletedItems);

		expect(deletedItems).toHaveLength(0);
	});

	test('Should delete all items By Search', async () => {
		await prisma.items.createMany({
			data: items,
		});

		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				password: await hashingPassword('password'),
				role: 'admin',
			},
		});

		const res = await request(app)
			.delete(`/api/beggy/private/items?field=category&search=books`)
			.set('Cookie', cookies)
			.set('X-XSRF-TOKEN', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`)
			.send({
				confirmDelete: true,
			});

		console.log('Response', res.body);
		console.log('Response data', res.body.data);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'Successfully Delete All Items By Search'
		);
		expect(res.body.meta.totalDelete).toBe(3);

		const deletedItems = await prisma.items.findMany({
			where: { category: 'BOOKS' },
		});

		console.log('Deleted Items', deletedItems);

		expect(deletedItems).toHaveLength(0);
	});
});

//*======================================={Items Private Route}==============================================
