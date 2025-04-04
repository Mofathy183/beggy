import prisma from '../../prisma/prisma.js';
import { birthOfDate, haveProfilePicture } from '../utils/userHelper.js';
import { hashingPassword } from '../utils/hash.js';
import { ErrorHandler } from '../utils/error.js';

export const addUser = async (body) => {
	try {
		const {
			firstName,
			lastName,
			email,
			password,
			confirmPassword,
			gender,
			birth,
			country,
			city,
			profilePicture,
		} = body;

		// Hashing the password
		if (password !== confirmPassword)
			return new ErrorHandler(
				'password',
				'password is not the same in confirmPassword',
				'Enter the same password in confirm password'
			);

		const hashPassword = await hashingPassword(password);

		// Create new user in Prisma
		const newUser = await prisma.user.create({
			data: {
				firstName,
				lastName,
				email,
				password: hashPassword,
				gender: gender,
				birth: birthOfDate(birth),
				country,
				city,
				profilePicture: haveProfilePicture(profilePicture),
			},
			include: {
				suitcases: true,
				bags: true,
				items: true,
				account: true,
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				passwordResetExpiredAt: true,
				passwordResetToken: true,
				role: true,
				isActive: true,
			},
		});

		if (!newUser)
			return new ErrorHandler(
				'user error',
				'No user created',
				'Failed to create user'
			);

		if (newUser.error)
			return new ErrorHandler(
				'prisma',
				newUser.error,
				'User already exists ' + newUser.error.message
			);

		const totalCount = await prisma.user.count();

		const meta = {
			totalCount: totalCount,
			totalCreate: newUser ? 1 : 0,
		};

		return { newUser: newUser, meta: meta };
	} catch (error) {
		return new ErrorHandler('catch error', error, 'Failed to create user');
	}
};

export const getUserById = async (userId) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
			include: {
				suitcases: true,
				bags: true,
				items: true,
				account: true,
			},
			omit: {
				password: true,
				passwordResetExpiredAt: true,
				passwordResetToken: true,
				passwordChangeAt: true,
			},
		});

		if (!user)
			return new ErrorHandler(
				'User null',
				'User not found',
				'There is no user with that id'
			);

		if (user.error)
			return new ErrorHandler(
				'prisma',
				user.error,
				'User not found ' + user.error.message
			);

		return user;
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to get user by id'
		);
	}
};

export const getAllUsers = async (pagination, searchFilter, orderBy) => {
	try {
		const { page, limit, offset } = pagination;

		const users = await prisma.user.findMany({
			where: { OR: searchFilter },
			include: {
				suitcases: true,
				bags: true,
				items: true,
				account: true,
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				passwordResetExpiredAt: true,
				passwordResetToken: true,
			},
			skip: offset,
			take: limit,
			orderBy: orderBy,
		});

		if (!users)
			return new ErrorHandler(
				'user',
				'No users found',
				'No users found in the database'
			);

		if (users.error)
			return new ErrorHandler(
				'prisma',
				'No users found ' + users.error,
				'No users found in the database ' + users.error.message
			);

		const totalUsers = await prisma.user.count({
			where: { isActive: true },
		});

		if (totalUsers.error)
			return new ErrorHandler(
				'Total users null',
				'No users found' || totalUsers.error,
				'No users found in the database'
			);

		const meta = {
			totalCount: totalUsers,
			totalFind: users.length,
			page: page,
			limit: limit,
			searchFilter: searchFilter,
			orderBy: orderBy,
		};

		return { users: users, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to get all users'
		);
	}
};

export const changeUserRole = async (id, body) => {
	try {
		const { role } = body;

		const updatedUser = await prisma.user.update({
			where: { id: id },
			data: {
				role: role,
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				passwordResetExpiredAt: true,
				passwordResetToken: true,
				isActive: true,
			},
		});

		if (!updatedUser)
			return new ErrorHandler(
				'User null',
				'User Cannot be modified',
				'There is no user with that id to modify'
			);

		if (updatedUser.error)
			return new ErrorHandler(
				'prisma',
				updatedUser.error,
				'User cannot be modified ' + updatedUser.error.message
			);

		return updatedUser;
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to modify user by id'
		);
	}
};

export const removeUser = async (userId) => {
	try {
		const userDeleted = await prisma.user.delete({
			where: { id: userId },
			omit: {
				password: true,
				passwordChangeAt: true,
				passwordResetExpiredAt: true,
				passwordResetToken: true,
				role: true,
				isActive: true,
			},
		});

		if (!userDeleted)
			return new ErrorHandler(
				'Delete null zero',
				'User cannot be deleted',
				'There is no user with that id to delete'
			);

		if (userDeleted.error)
			return new ErrorHandler(
				'prisma',
				userDeleted.error,
				'User cannot be deleted for database ' +
					userDeleted.error.message
			);

		const totalCount = await prisma.user.count();

		const meta = {
			totalCount: totalCount,
			totalDelete: userDeleted ? 1 : 0,
		};

		return { userDeleted: userDeleted, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to remove user by id'
		);
	}
};

export const removeAllUsers = async (searchFilter) => {
	try {
		const usersDeleted = await prisma.user.deleteMany({
			where: {
				OR: searchFilter,
			},
		});

		if (usersDeleted.error)
			return new ErrorHandler(
				'prisma',
				usersDeleted.error,
				'Cannot remove all users for database ' +
					usersDeleted.error.message
			);

		const totalCount = await prisma.user.count();

		const meta = {
			totalCount: totalCount,
			totalDelete: usersDeleted.count,
			totalSearch: searchFilter ? usersDeleted.count : 0,
		};

		return { usersDeleted: usersDeleted, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to remove all users'
		);
	}
};
