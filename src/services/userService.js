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

export const getUserById = async (id) => {
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

export const getAllUsers = async (pagination) => {
	try {
        const { page, limit, offset } = pagination;
        
		const users = await UserModel.findMany({
			where: { isActive: true }, // Only return active users
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
			skip: offset,
			take: limit,
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

//* for PUT requests
export const replaceResource = async (id, body) => {
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

		if (password !== confirmPassword)
			return new ErrorHandler(
				'password',
				'password is not the same in confirmPassword',
				'Enter the same password in confirm password'
			);

		const hashedPassword = await hashingPassword(password);

		const updatedUser = await UserModel.update({
			where: { id: id },
			data: {
				firstName,
				lastName,
				email,
				password: hashedPassword,
				passwordChangeAt: passwordChangeAt(),
				gender: gender,
				profilePicture: haveProfilePicture(profilePicture),
				birth: birthOfDate(birth),
				country,
			},
			include: {
				suitcases: true,
				bags: true,
				items: true,
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
				'User Cannot be updated',
				'There is no user with that id to update'
			);

		if (updatedUser.error)
			return new ErrorHandler(
				'prisma',
				updatedUser.error,
				'User cannot be updated'
			);

		return updatedUser;
	} catch (error) {
		return new ErrorHandler(
			'catch error',
			error,
			'Failed to update user by id'
		);
	}
};

//* for PATCH requests
export const modifyResource = async (id, body) => {
	try {
		const {
			firstName,
			lastName,
			email,
			gender,
			birth,
			country,
			confirmPassword,
			profilePicture,
		} = body;

		if (body.password) {
			if (body.password !== confirmPassword)
				return new ErrorHandler(
					'password',
					'password is not the same in confirmPassword',
					'Enter the same password in confirm password'
				);

			const hashedPassword = await hashingPassword(password);
			body.password = hashedPassword;
		}

		const updatedUser = await UserModel.update({
			where: { id: id },
			data: {
				firstName: firstName || undefined,
				lastName: lastName || undefined,
				email: email || undefined,
				password: body.password || undefined,
				gender: gender || undefined,
				profilePicture: haveProfilePicture(profilePicture),
				passwordResetAt: body.password ? passwordChangeAt() : undefined,
				birth: birthOfDate(birth),
				country: country || undefined,
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
