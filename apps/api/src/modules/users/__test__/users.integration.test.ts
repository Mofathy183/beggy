import prisma from '../../../prisma/prisma.js';
import type { PrismaClient } from '../generated/client/index.js';
import app from '../../../app.js';
import request from 'supertest';
import { hashingPassword } from '../../utils/hash.js';
import { signToken } from '../../utils/jwt.js';
import { filterQuery } from '../setup.test.js';

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

//*============================================={{ADMIN TEST}}========================================================

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

//*============================================={{ADMIN TEST}}========================================================

//*============================================={{USER TEST}}========================================================
describe('Auth API Tests For Deactivate', () => {
	let user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser77@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		token = signToken(user.id);
	});

	test('Should deactivate a user', async () => {
		expect(user.isActive).toBe(true);

		const res = await request(app)
			.delete('/api/beggy/auth/deactivate')
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Deactivated User Account',
			data: 'Your Account Deactivated Successfully',
		});

		const deactivateUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { isActive: true },
		});

		expect(deactivateUser.isActive).toBe(false);
	});
});

describe('Auth API Tests For Authentic User For Frontend', () => {
	let user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser22@test.com',
				password: await hashingPassword('testing123'),
				birth: birthOfDate('2005-12-12'),
			},
		});

		token = signToken(user.id);
	});

	test('Should Authenticate User Successfully and Include All Related Data', async () => {
		const res = await request(app)
			.get('/api/beggy/auth/me')
			.set('Cookie', [`accessToken=${token}`]);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: "You've Authenticated Successfully",
		});

		const { data, meta } = res.body;

		expect(data).toMatchObject({
			user: {
				id: user.id,
				email: 'testuser22@test.com',
				firstName: 'John',
				lastName: 'Doe',
				displayName: 'John Doe',
				age: 19,
				birth: '2005-12-12T00:00:00.000Z',
				isActive: true,
			},
		});

		expect(Array.isArray(data.account)).toBe(true);
		expect(Array.isArray(data.bags)).toBe(true);
		expect(Array.isArray(data.items)).toBe(true);
		expect(Array.isArray(data.suitcases)).toBe(true);

		expect(meta).toMatchObject({
			totalItemsInBags: 0,
			totalItemsInSuitcases: 0,
			stuffStates: {
				bags: 0,
				suitcases: 0,
				items: 0,
			},
		});

		expect(data.bags).toEqual([]);
		expect(data.suitcases).toEqual([]);
		expect(data.items).toEqual([]);
	});

	test('Should Return Error 401 Unauthorized Because User ID i not Valid', async () => {
		const res = await request(app)
			.get('/api/beggy/auth/me')
			.set('Cookie', [
				`accessToken=${signToken(user.id + 'fdf6sd5f6s5df')}`,
			]);

		expect(res.status).toBe(401);
		expect(res.body).toMatchObject({
			success: false,
			status: 'Unauthorized',
			message: 'User not found in the database. Please login again.',
		});
	});

	test('Should Return Error 401 Unauthorized Because JWT Token is Expired', async () => {
		const expiredToken = jwt.sign(
			{ id: user.id }, // your payload
			JWTConfig.secret, // use the same secret as in your app
			{ expiresIn: -10 } // token expired 10 seconds ago
		);

		const res = await request(app)
			.get('/api/beggy/auth/me')
			.set('Cookie', [`accessToken=${expiredToken}`]);

		expect(res.status).toBe(401);
		expect(res.body).toMatchObject({
			success: false,
			status: 'Unauthorized',
			message: 'Access token is expired or invalid. Please login again.',
		});
	});
});

describe('Auth API Tests For get permissions by role', () => {
	test('Should get user permissions', async () => {
		const user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser22@test.com',
				password: await hashingPassword('testing123'),
				birth: birthOfDate('2005-12-12'),
			},
		});

		const res = await request(app)
			.get('/api/beggy/auth/permissions')
			.set('Cookie', [`accessToken=${signToken(user.id)}`]);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Get User Permissions',
		});

		expect(res.body.data).toBeDefined();
		expect(Array.isArray(res.body.data)).toBe(true);
	});
});

describe('Auth API Tests For Change Password', () => {
	let user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser55@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		token = signToken(user.id);
	});

	test("Should Change user's password", async () => {
		const res = await request(app)
			.patch('/api/beggy/auth/change-password')
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				currentPassword: 'testing123',
				newPassword: 'testing123456',
				confirmPassword: 'testing123456',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Password changed successfully',
			data: 'Your password has been updated.',
		});

		const updatedUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { password: true },
		});

		const isMatch = await verifyPassword(
			'testing123456',
			updatedUser.password
		);
		expect(isMatch).toBe(true); // ✅ Password was updated successfully
	});
});

describe('Auth API Tests For Edit Profile', () => {
	let user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser55@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		token = signToken(user.id);
	});

	test("Should Edit a user's Profile", async () => {
		const res = await request(app)
			.patch('/api/beggy/auth/edit-profile')
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				firstName: 'Jane',
				lastName: 'Doe',
				gender: 'male',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Profile updated successfully',
			data: 'Your profile information has been updated.',
		});

		const updatedUser = await prisma.user.findUnique({
			where: { id: user.id },
		});

		expect(updatedUser).toMatchObject({
			id: user.id,
			firstName: 'Jane',
			lastName: 'Doe',
			gender: 'MALE',
		});
	});
});

describe('Auth API Tests For Change Email', () => {
	let user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser55@test.com',
				password: await hashingPassword('testing123'),
			},
		});

		token = signToken(user.id);
	});

	test.skip("Should change a user's email", async () => {
		const res = await request(app)
			.patch('/api/beggy/auth/change-email')
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				email: 'mofathy1833@gmail.com',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Successfully Updated Your Email',
			data: 'Check your email inbox to verify your email',
		});

		const userToken = await prisma.userToken.findUnique({
			where: { userId: user.id },
		});

		expect(userToken.type).toBe('CHANGE_EMAIL');

		const userEmail = await prisma.user.findUnique({
			where: { id: user.id },
			select: { email: true },
		});

		expect(userEmail.email).toBe('mofathy1833@gmail.com');
	});
});

describe('Auth API Tests For send Verification Email', () => {
	let user, token;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'mofathy1833@gmail.com',
				password: await hashingPassword('testing123'),
			},
		});

		token = signToken(user.id);
	});

	test.skip('Should send a verification email', async () => {
		const res = await request(app)
			.post('/api/beggy/auth/send-verification-email')
			.set('Cookie', [...cookies, `accessToken=${token}`])
			.set('X-CSRF-Secret', csrfSecret)
			.set('x-csrf-token', csrfToken)
			.send({
				email: 'mofathy1833@gmail.com',
			});

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Verification email send Successfully',
			data: 'Check your email inbox to verify your email',
		});

		const userToken = await prisma.userToken.findUnique({
			where: { userId: user.id },
		});

		expect(userToken.type).toBe('EMAIL_VERIFICATION');
	});
});
//*============================================={{USER TEST}}========================================================

//*======================================={Users Public Route}==============================================

describe('User API Tests For Get User Public Data', () => {
	let user;

	beforeEach(async () => {
		user = await prisma.user.create({
			data: {
				firstName: 'John',
				lastName: 'Doe',
				email: 'testuser123@example.com',
				password: await hashingPassword('password123'),
			},
		});
	});

	test('Get User Public Data', async () => {
		const res = await request(app).get(
			`/api/beggy/public/users/${user.id}`
		);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'User Retrieved By Its ID Successfully',
		});

		expect(res.body.data).toMatchObject({
			id: user.id,
			firstName: 'John',
			lastName: 'Doe',
			email: 'testuser123@example.com',
		});
	});
});

describe('User API Tests For Search For Users Public Profiles', () => {
	const filter = { firstName: 'John', lastName: 'Doe' };

	test('Search for User by his first and last name', async () => {
		await prisma.user.createMany({
			data: users.filter((u) => {
				return (
					u.firstName === filter.firstName &&
					u.lastName === filter.lastName
				);
			}),
		});

		const res = await request(app).get(
			`/api/beggy/public/users?${filterQuery(filter)}`
		);

		expect(res.status).toBe(200);
		expect(res.body).toMatchObject({
			success: true,
			message: 'Users Found Successfully By Search',
		});

		expect(res.body.data[0]).toMatchObject({
			id: res.body.data[0].id,
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
		expect(res.body).toMatchObject({
			success: true,
			message: 'Users Found Successfully',
		});

		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data.length).toBeGreaterThan(0);
	});
});

//*======================================={Users Public Route}==============================================
