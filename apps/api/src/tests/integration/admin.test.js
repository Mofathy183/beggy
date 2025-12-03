import prisma from '../../../prisma/prisma.js';
import app from '../../../app.js';
import request from 'supertest';
import { hashingPassword } from '../../utils/hash.js';
import { signToken } from '../../utils/jwt.js';
import { filterQuery } from '../setup.test.js';

const users = [
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
		.find((cookie) => cookie.startsWith('X-CSRF-Secret='))
		.split(';')[0];

	csrfSecret = secret.split('=')[1];
	csrfToken = response.body.data.csrfToken;
});

test('Should return a CSRF token', async () => {
	expect(csrfToken).toBeDefined();
	expect(csrfSecret).toBeDefined();
});

describe('User API tests For Get User Private Data For Admin and Member', () => {
	let user, admin, token;

	beforeEach(async () => {
		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});

		user = await prisma.user.create({
			data: {
				firstName: 'Jane',
				lastName: 'Smith',
				email: 'testuser456@example.com',
				password: await hashingPassword('password456'),
			},
		});

		token = signToken(admin.id);
	});

	test('Get User Private Data For Admin', async () => {
		const res = await request(app)
			.get(`/api/beggy/admin/${user.id}`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'User Found Successfully',
		});

		expect(res.body.data).toMatchObject({
			id: user.id,
			firstName: 'Jane',
			lastName: 'Smith',
			email: 'testuser456@example.com',
			role: 'USER',
		});
	});
});

describe('User API Tests For Search For User by only Admin and Member', () => {
	let admin, token;
	const filter = { lastName: 'Williams', limit: 5, page: 1 };

	beforeEach(async () => {
		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});

		await prisma.user.createMany({
			data: users,
		});

		token = signToken(admin.id);
	});

	test('Search for User by his first and last name', async () => {
		const usersFiltered = users.filter(
			(user) => user.lastName === filter.lastName
		);

		const res = await request(app)
			.get(`/api/beggy/admin/?${filterQuery(filter)}`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Users Found Successfully By Search',
		});

		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.meta.totalFind).toBe(usersFiltered.length);

		res.body.data.forEach((user) => {
			expect(user).toMatchObject({ lastName: 'Williams' });
		});
	});

	test('Should Get All Users', async () => {
		delete filter.lastName;

		const res = await request(app)
			.get(`/api/beggy/admin/?${filterQuery(filter)}`)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Users Found Successfully',
		});

		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.meta.totalFind).toBe(filter.limit);
	});
});

describe('User API Tests For Create User by only Admin', () => {
	let admin, token;

	beforeEach(async () => {
		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});
		token = signToken(admin.id);
	});

	test('Should Create a new User by Admin only', async () => {
		const res = await request(app)
			.post(`/api/beggy/admin/`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				firstName: 'Jane',
				lastName: 'Smith',
				email: 'testuser456@example.com',
				password: 'password456',
				confirmPassword: 'password456',
			});

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({
			success: true,
			message: 'User Created Successfully',
		});

		expect(res.body.meta.totalCreate).toBe(1);

		expect(res.body.data).toMatchObject({
			id: res.body.data.id,
			firstName: 'Jane',
			lastName: 'Smith',
			email: 'testuser456@example.com',
		});
	});
});

describe('User API Tests For Change User Role By Only Admin', () => {
	let user, admin, token;

	beforeEach(async () => {
		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});

		user = await prisma.user.create({
			data: {
				firstName: 'Jane',
				lastName: 'Smith',
				email: 'testuser456@example.com',
				password: await hashingPassword('password456'),
			},
		});

		token = signToken(admin.id);
	});

	test('Should Change User Role', async () => {
		const res = await request(app)
			.patch(`/api/beggy/admin/${user.id}/role`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`)
			.send({
				role: 'ADMIN',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Change User Role Successfully',
		});

		expect(res.body.data).toMatchObject({
			id: res.body.data.id,
			role: 'ADMIN',
		});
	});
});

describe('User API Tests For Delete User By User ID Just For Admin', () => {
	let user, admin, token;

	beforeEach(async () => {
		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});

		user = await prisma.user.create({
			data: {
				firstName: 'Jane',
				lastName: 'Smith',
				email: 'testuser456@example.com',
				password: await hashingPassword('password456'),
			},
		});

		token = signToken(admin.id);
	});

	test('Should Delete User by User ID', async () => {
		const res = await request(app)
			.delete(`/api/beggy/admin/${user.id}`)
			.set('Cookie', cookies)
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'User Deleted Successfully',
		});

		expect(res.body.meta.totalDelete).toBe(1);
		expect(res.body.data).toMatchObject({
			id: res.body.data.id,
			firstName: 'Jane',
			lastName: 'Smith',
			email: 'testuser456@example.com',
		});
	});
});

describe('User API Tests For Delete All User From Database Only for Admin', () => {
	let admin, token;
	const filter = { firstName: 'John' };

	beforeEach(async () => {
		admin = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser123@example.com',
				password: await hashingPassword('password123'),
				role: 'ADMIN',
			},
		});

		await prisma.user.createMany({
			data: users,
		});

		token = signToken(admin.id);
	});

	test('Should Delete All Users', async () => {
		const res = await request(app)
			.delete(`/api/beggy/admin/`)
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
			message: 'All Users Are Deleted Successfully',
		});

		expect(res.body.data).toMatchObject({
			count: users.length,
		});
	});

	test('Should Delete All Users By Query', async () => {
		const usersFiltered = users.filter(
			(user) => user.firstName === filter.firstName
		);

		const res = await request(app)
			.delete(`/api/beggy/admin/?${filterQuery(filter)}`)
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
			message: 'All Users Are Deleted Successfully By Search Filter',
		});

		expect(res.body.data).toMatchObject({
			count: usersFiltered.length,
		});

		expect(res.body.meta).toMatchObject({
			totalSearch: usersFiltered.length,
		});
	});
});
