import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import request from 'supertest';
import { hashingPassword } from '../../utils/hash.js';
import { signToken } from '../../utils/jwt.js';

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
		firstName: 'John',
		lastName: 'Williams',
		email: 'testuser708@example.com',
		password: await hashingPassword('password101'),
	},
];

let csrfToken;
let csrfSecret;
let cookies;

beforeAll(async () => {
	const response = await request(app).get('/api/beggy/auth/csrf-token');
	cookies = response.headers['set-cookie'];
	let secret = cookies
		.find((cookie) => cookie.startsWith('x-csrf-secret='))
		.split(';')[0];

	csrfSecret = secret.split('=')[1];
	csrfToken = response.body.data.csrfToken;
});

test('Should return a CSRF token', async () => {
	expect(csrfToken).toBeDefined();
	expect(csrfSecret).toBeDefined();
});

describe('User API tests For Get User Private Data For Admin and Member', () => {
	test('Get User Private Data For Admin', async () => {
		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});

		const user = await prisma.user.create({
			data: {
				firstName: 'Jane',
				lastName: 'Smith',
				email: 'testuser456@example.com',
				password: await hashingPassword('password456'),
			},
		});

		const res = await request(app)
			.get(`/api/beggy/users/${user.id}`)
			.set('Authorization', `Bearer ${signToken(admin.id)}`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('User Found Successfully');
		expect(res.body.data).toMatchObject({
			id: user.id,
			firstName: 'Jane',
			lastName: 'Smith',
			email: 'testuser456@example.com',
			role: 'USER',
		});

		console.log('Response', res.body);

		const isUser = await prisma.user.findUnique({ where: { id: user.id } });

		expect(isUser).not.toBeNull();
		expect(isUser).toMatchObject({
			id: isUser.id,
			firstName: 'Jane',
			lastName: 'Smith',
			email: 'testuser456@example.com',
			role: 'USER',
		});
	});
});

describe('User API Tests For Search For User by only Admin and Member', () => {
	test('Search for User by his first and last name', async () => {
		await prisma.user.createMany({
			data: users,
		});

		const admin = await prisma.user.create({
			data: {
				firstName: 'Jo',
				lastName: 'Mark',
				email: 'testadmin123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});

		const res = await request(app)
			.get(`/api/beggy/users/?lastName=Williams`)
			.set('Authorization', `Bearer ${signToken(admin.id)}`);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Users Found Successfully By Search');
		res.body.data.filter((user) => user.lastName === 'Williams')
            .forEach((user) => { expect(user).toMatchObject({ lastName: 'Williams' }) })

		console.log('Response', res.body);
		console.log('Response data', res.body.meta.searchFilter);

		const isUsers = await prisma.user.findMany({
			where: {
				OR: [
					{ lastName: { contains: 'Williams', mode: 'insensitive' } },
				],
			},
		});

		expect(isUsers[0]).toMatchObject({
			id: isUsers[0].id,
			firstName: 'Alice',
			lastName: 'Williams',
			email: 'testuser101@example.com',
		});
	});

	test('Should Get All Users', async () => {
		await prisma.user.createMany({
			data: users,
		});

		const admin = await prisma.user.create({
			data: {
				firstName: 'Jo',
				lastName: 'Mark',
				email: 'testadmin123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});

		const res = await request(app)
			.get(`/api/beggy/users/?limit=5&page=1`)
			.set('Authorization', `Bearer ${signToken(admin.id)}`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Users Found Successfully');
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.meta.totalFind).toBe(5);
	});
});

describe('User API Tests For Create User by only Admin', () => {
	test('Should Create a new User by Admin only', async () => {
		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});

		const res = await request(app)
			.post(`/api/beggy/users/`)
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`)
			.send({
				firstName: 'Jane',
				lastName: 'Smith',
				email: 'testuser456@example.com',
				password: 'password456',
				confirmPassword: 'password456',
			});

		console.log('Response', res.body);

		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('User Created Successfully');
		expect(res.body.meta.totalCreate).toBe(1);
		expect(res.body.data).toMatchObject({
			id: res.body.data.id,
			firstName: 'Jane',
			lastName: 'Smith',
			email: 'testuser456@example.com',
		});

		const isUser = await prisma.user.findUnique({
			where: { id: res.body.data.id },
		});

		expect(isUser).not.toBeNull();
		expect(isUser).toMatchObject({
			id: isUser.id,
			firstName: 'Jane',
			lastName: 'Smith',
			email: 'testuser456@example.com',
		});
	});
});

describe('User API Tests For Change User Role By Only Admin', () => {
	test('Should Change User Role', async () => {
		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testadmin123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});

		const user = await prisma.user.create({
			data: {
				firstName: 'Jane',
				lastName: 'Smith',
				email: 'testuser456@example.com',
				password: await hashingPassword('password456'),
			},
		});

		const res = await request(app)
			.patch(`/api/beggy/users/${user.id}/role`)
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`)
			.send({
				role: 'ADMIN',
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('Change User Role Successfully');
		expect(res.body.data).toMatchObject({
			id: res.body.data.id,
			firstName: 'Jane',
			lastName: 'Smith',
			email: 'testuser456@example.com',
			role: 'ADMIN',
		});

		const isUser = await prisma.user.findUnique({
			where: { id: res.body.data.id },
		});

		expect(isUser).not.toBeNull();
		expect(isUser).toMatchObject({
			id: isUser.id,
			firstName: 'Jane',
			lastName: 'Smith',
			email: 'testuser456@example.com',
			role: 'ADMIN',
		});
	});
});

describe('User API Tests For Delete User By User ID Just For Admin and Member', () => {
	test('Should Delete User by User ID', async () => {
		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testadmin123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});

		const member = await prisma.user.create({
			data: {
				firstName: 'Jane',
				lastName: 'Smith',
				email: 'testuser456@example.com',
				password: await hashingPassword('password456'),
				role: 'MEMBER',
			},
		});

		const res = await request(app)
			.delete(`/api/beggy/users/${member.id}`)
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`);

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('User Deleted Successfully');
		expect(res.body.meta.totalDelete).toBe(1);
		expect(res.body.data).toMatchObject({
			id: res.body.data.id,
			firstName: 'Jane',
			lastName: 'Smith',
			email: 'testuser456@example.com',
		});

		const isUser = await prisma.user.findUnique({
			where: { id: member.id },
		});

		expect(isUser).toBe(null);
	});
});

describe('User API Tests For Delete All User From Database Only for Admin', () => {
	test('Should Delete All Users', async () => {
		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testadmin123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});

		await prisma.user.createMany({
			data: users,
		});

		const res = await request(app)
			.delete(`/api/beggy/users/`)
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`)
			.send({
				confirmDelete: true,
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe('All Users Are Deleted Successfully');
		expect(res.body.data).toMatchObject({
			count: res.body.data.count,
		});

		const usersAfterDeletion = await prisma.user.findMany({ where: {} });

		expect(usersAfterDeletion).toHaveLength(0);
		expect(usersAfterDeletion).toEqual([]);
	});

	test('Should Delete All Users By Query', async () => {
		const admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testadmin123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});

		await prisma.user.createMany({
			data: users,
		});

		const res = await request(app)
			.delete(`/api/beggy/users/?firstName=John`)
			.set('Cookie', cookies)
			.set('x-csrf-secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${signToken(admin.id)}`)
			.send({
				confirmDelete: true,
			});

		console.log('Response', res.body);

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.message).toBe(
			'All Users Are Deleted Successfully By Search Filter'
		);
		expect(res.body.data).toMatchObject({
			count: res.body.data.count,
		});
		expect(res.body.meta).toMatchObject({
			totalSearch: res.body.data.count,
		});

		const usersAfterDeletion = await prisma.user.findMany({
			where: { firstName: 'John' },
		});

		expect(usersAfterDeletion).toHaveLength(0);
		expect(usersAfterDeletion).toEqual([]);
	});
});
