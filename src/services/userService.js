import prisma from '../../prisma/prisma.js';
import {
	birthOfDate,
	haveProfilePicture,
} from '../utils/userHelper.js';
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
				createdAt: true,
				updatedAt: true,
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
				'User already exists '+ newUser.error.message
			);

		return newUser;
	} catch (error) {
		return new ErrorHandler('catch error', error, 'Failed to create user');
	}
};

export const getUserPublicProfile = async (id) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
                id: id,
                AND: {
                    isActive: true, // Only return active users
                }
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				displayName: true,
				email: true,
				gender: true,
				birth: true,
                age: true,
				country: true,
                city: true,
				profilePicture: true,
                suitcases: true,
				bags: true,
				items: true,
				account: true,
				createdAt: true,
				updatedAt: true,
			},
		});

        if (!user) return new ErrorHandler(
            'user',
            'User not found',
            'User not found in the database'
        )

		if (!user.error)
			return new ErrorHandler(
				'prisma',
				'User not found '+user.error,
				'User not found in the database '+user.error.message
			);

		return user;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to get user public profile'
		);
	}
};

export const getUserById = async (id) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: id,
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
			},
		});

		if (!user)
			return new ErrorHandler(
				'User null',
				'User not found',
				'There is no user with that id'
			);

        if (user.error) return new ErrorHandler(
            'prisma',
            user.error,
            'User not found '+user.error.message
        )

		return user;
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to get user by id'
		);
	}
};

export const getAllPublicUsers = async (pagination, searchFilter) => {
	try {
		const { page, limit, offset } = pagination;

		const users = await prisma.user.findMany({
			where: { OR: searchFilter, isActive: true },
			omit: {
				password: true,
				passwordChangeAt: true,
				passwordResetExpiredAt: true,
				passwordResetToken: true,
				role: true,
				gender: true,
				birth: true,
				email: true,
				createdAt: true,
				updatedAt: true,
				suitcases: true,
				bags: true,
				items: true,
				account: true,
			},
			skip: offset,
			take: limit,
		});

        if (users.error) return new ErrorHandler(
            'prisma',
            users.error,
            'Failed to get all public users '+users.error.message
        )

		const totalCount = await prisma.user.count({ where: { isActive: true } });

		const meta = {
			total: totalCount,
			page: page,
			limit: limit,
			searchFilter: searchFilter,
			orderBy: orderBy,
		};

		return { users: users, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to get all public users'
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

		if (users.error)
			return new ErrorHandler(
				'prsima',
				'No users found '+ users.error,
				'No users found in the database '+ users.error.message
			);

		const totalUsers = await prisma.user.count({ where: { isActive: true } });

		if (totalUsers.error)
			return new ErrorHandler(
				'Total users null',
				'No users found' || totalUsers.error,
				'No users found in the database'
			);

		const meta = {
			total: totalUsers,
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

//* for PATCH requests
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
				createdAt: true,
				updatedAt: true,
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
				'User cannot be modified '+ updatedUser.error.message
			);

		return updatedUser;
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to modeify user by id'
		);
	}
};

export const removeUser = async (id) => {
	try {
		const deleteUser = await prisma.user.delete({
			where: { id: id },
			omit: {
				password: true,
				createdAt: true,
				updatedAt: true,
				passwordChangeAt: true,
				passwordResetExpiredAt: true,
				passwordResetToken: true,
				role: true,
				isActive: true,
			},
		});

		if (!deleteUser)
			return new ErrorHandler(
				'Delete null zero',
				'User cannot be deleted',
				'There is no user with that id to delete'
			);

		if (deleteUser.error)
			return new ErrorHandler(
				'prisma',
				deleteUser.error,
				'User cannot be deleted for datebase '+deleteUser.error.message
			);

		return deleteUser;
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to remove user by id'
		);
	}
};

export const removeAllUsers = async () => {
	try {
		const removeAll = await prisma.user.deleteMany();

		if (removeAll.error)
			return new ErrorHandler(
				'prisma',
				removeAll.error,
				'Connot remove all users for database '+removeAll.error.message
			);

		return removeAll;
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to remove all users'
		);
	}
};
