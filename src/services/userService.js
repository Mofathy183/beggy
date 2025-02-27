import { UserModel } from '../../prisma/prisma.js';
import {
	birthOfDate,
	haveProfilePicture,
	passwordChangeAt,
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
		const newUser = await UserModel.create({
			data: {
				firstName,
				lastName,
				email,
				password: hashPassword,
				gender: gender,
				birth: birthOfDate(birth),
				country,
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
				'User already exists'
			);

		return newUser;
	} catch (error) {
		return new ErrorHandler('catch error', error, 'Failed to create user');
	}
};

export const getUserPublicProfile = async (id) => {
	try {
		const user = await UserModel.findUnique({
			where: {
				id: id,
				isActive: true, // Only return active users
			},
			include: {
				suitcases: true,
				bags: true,
				items: true,
				account: true,
			},
			select: {
				id: true,
				firstName: true,
				lastName: true,
				displayName: true,
				email: true,
				gender: true,
				birth: true,
				country: true,
				profilePicture: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		if (!user || user.error)
			return new ErrorHandler(
				'user',
				'User not found' || user.error,
				'User not found in the database' || user.error.message
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
		const user = await UserModel.findUnique({
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

		if (!user || user.error)
			return new ErrorHandler(
				'User null',
				'User not found' || user.error,
				'There is no user with that id'
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

export const getAllPublicUsers = async (pagination, searchFilter) => {
	try {
		const { page, limit, offset } = pagination;

		const users = await UserModel.findMany({
			where: { OR: searchFilter, isActive: true },
			omit: {
				password: true,
				passwordChangeAt: true,
				passwordResetExpiredAt: true,
				passwordResetToken: true,
				role: true,
				gender: true,
				birth: true,
				country: true,
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

		if (!users || users.length === 0)
			return new ErrorHandler(
				'users',
				'No users found',
				'No users found in the database'
			);

		const totalCount = users.length;

		const meta = {
			totalCount,
			page,
			limit,
			offset,
			searchFilter,
		};

		return { users, meta };
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

		const users = await UserModel.findMany({
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
				'Users null',
				'No users found' || users.error,
				'No users found in the database'
			);

		const totalUsers = await UserModel.count({ where: { isActive: true } });

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

		return { users, meta };
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

		const updatedUser = await UserModel.update({
			where: { id: id },
			data: {
				role: role.toUpperCase(),
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
				'User cannot be modified'
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
		const deleteUser = await UserModel.delete({
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
				'User cannot be deleted for datebase'
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
		const removeAll = await UserModel.deleteMany({ where: {} });

		if (!removeAll || removeAll.count === 0)
			return new ErrorHandler(
				'Delete null zero',
				'No users to delete',
				'No users found in the database to delete'
			);

		if (removeAll.error)
			return new ErrorHandler(
				'prisma',
				removeAll.error,
				'Connot remove all users for database'
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

//* Test the function
// const body = {
//     "firstName": "Mark",
//     "lastName": "Rose",
//     "email": "target@example.com",
//     "password": "P@assW00rd",
//     "confirmPassword": "P@assW00rd",
//     "gender": "male",
//     "birth": "1998-02-08",
//     "country": "Span"
// };

// (async () => {
//     try {
//         const user = await getAllUsers({page:1, limit:10, offset:0});
//         console.log(user);
//     }
//     catch (error) {
//         console.error("Error creating user:", error);
//     }
// })();
