import ErrorHandler from '../utils/error.js';
import { hashingPassword, verifyPassword } from '../utils/hash.js';
import { UserModel } from '../../prisma/prisma.js';
import {
	generateCryptoToken,
	generateResetToken,
} from '../utils/authHelper.js';
import {
	resetPasswordExpiredAt,
	passwordChangeAt,
	birthOfDate,
	haveProfilePicture,
} from '../utils/userHelper.js';

export const singUpUser = async (body) => {
	try {
		const {
			firstName,
			lastName,
			username,
			email,
			password,
			confirmPassword,
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
				username,
				email,
				password: hashPassword,
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

		if (newUser.error)
			new ErrorHandler(
				'prisma',
				newUser.error,
				'Prisma error while Sign up user'
			);

		const { role, ...safeUser } = newUser;

		return { role, safeUser };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to sign up user');
	}
};

export const loginUser = async (body) => {
	try {
		const { email, password } = body;

		// Check if user exists
		const user = await UserModel.findUnique({
			where: { email: email },
			include: {
				suitcases: true,
				bags: true,
				items: true,
				account: true,
			},
			omit: {
				createdAt: true,
				updatedAt: true,
				passwordChangeAt: true,
				passwordResetExpiredAt: true,
				passwordResetToken: true,
			},
		});

		const { role, isActive, password: userPassword, ...safeUser } = user;

		if (!user)
			new ErrorHandler(
				'user',
				'There is no user with that email',
				'User not found'
			);

		if (user.error)
			new ErrorHandler('prisma', user.error, 'User not found');

		// Check if password matches
		const isPasswordMatch = await verifyPassword(password, userPassword);

		if (!isPasswordMatch)
			return new ErrorHandler(
				'password',
				'Incorrect Password',
				'Incorrect password'
			);

		//? Check if user is deactive (isActive is false)
		//* to make it isActive to true
		if (!isActive) {
			UserModel.update({
				where: { id: user.id },
				data: { isActive: true },
			});
		}

		return { role, safeUser };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to login user');
	}
};

export const userForgotPassword = async (email) => {
	try {
		const user = await UserModel.findUnique({ where: { email: email } });

		if (!user)
			new ErrorHandler(
				'user',
				'There is no user with that email',
				'User not found'
			);

		if (user.error)
			return new ErrorHandler('prisma', user.error, 'User not found');

		//* Generate a random password by crypto
		const { resetToken, hashResetToken } = generateResetToken();

		//* get the reset expired token date, than add it to database.
		const resetExpiredAt = resetPasswordExpiredAt();

		const updateUser = await UserModel.update({
			where: { id: user.id },
			data: {
				passwordResetToken: hashResetToken,
				passwordResetExpiredAt: resetExpiredAt,
			},
		});

		if (!user)
			return new ErrorHandler(
				'user is null',
				'Failed to update user password reset token and expired at',
				'Failed to update user password reset token and expired at'
			);

		if (updateUser.error)
			return new ErrorHandler(
				'prisma',
				updateUser.error,
				'Failed to update user password reset token and expired at'
			);

		//* return reset token to send an email
		return resetToken;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to send reset password email to user'
		);
	}
};

export const resetUserPassword = async (body, token) => {
	try {
		const hashedToken = generateCryptoToken(token);

		const { password, confirmPassword } = body;

		//* get user by reset token
		const user = await UserModel.findUnique({
			where: { passwordResetToken: hashedToken },
		});

		if (!user || user.error)
			return new ErrorHandler(
				'user is null',
				'invalid Reset Token' || user.error,
				'token is invalid or expired'
			);

		//? if the 10 minutes to reset the password is still in effect
		if (new Date() > user.passwordResetExpiredAt)
			return new ErrorHandler(
				'timeout to reset password',
				'You passed the time to reset your password',
				'Password reset token expired'
			);

		if (password !== confirmPassword)
			return new ErrorHandler(
				'password',
				'password is not the same in confirmPassword',
				'Enter the same password in confirm password'
			);

		const hashedPassword = await hashingPassword(password);

		//* update the password
		const updatePassword = await UserModel.update({
			where: { id: user.id },
			data: {
				password: hashedPassword,
				passwordResetToken: null,
				passwordResetExpiredAt: null,
				passwordChangeAt: passwordChangeAt(),
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

		if (updatePassword.error)
			return new ErrorHandler(
				'prisma',
				updatePassword.error,
				'Failed to update user password'
			);

		const { role, ...safeUser } = updatePassword;

		return { role, safeUser };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to reset user password'
		);
	}
};

//*  when the user login he can update his password
export const updateUserPassword = async (userId, body) => {
	try {
		const { currentPassword, newPassword, confirmPassword } = body;

		const userPaaword = await UserModel.findUnique({
			where: { id: userId },
			select: {
				password: true,
				passwordChangeAt: true,
			},
		});

		if (!userPaaword || userPaaword.error)
			return ErrorHandler(
				'user is null',
				"Couldn't find user" || userPaaword.error,
				'Error updating user password'
			);

		const isMatch = await verifyPassword(
			currentPassword,
			userPaaword.password
		);
		if (!isMatch)
			return ErrorHandler(
				'password',
				'password is not correct',
				'Incorrect password'
			);

		if (newPassword !== confirmPassword)
			return ErrorHandler(
				'password',
				'password is not the same in confirmPassword',
				'Enter the same password in confirm password'
			);

		const hashedPassword = await hashingPassword(newPassword);

		const updatePassword = await UserModel.update({
			where: { id: userId },
			data: {
				password: hashedPassword,
				passwordChangeAt: passwordChangeAt(),
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

		if (!updatePassword)
			return ErrorHandler(
				'update password is null',
				"Couldn't update password",
				'Failed to update user password'
			);

		if (updatePassword.error)
			return ErrorHandler(
				'prisma',
				updatePassword.error,
				'Failed to update user password'
			);

		const { role, ...safeUser } = updatePassword;

		return { role, safeUser };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to update user password'
		);
	}
};

export const updateUserData = async (userId, body) => {
	try {
		const {
			firstName,
			lastName,
			email,
			gender,
			birth,
			country,
			profilePicture,
		} = body;

		const updatedUserData = await UserModel.update({
			where: { id: userId },
			data: {
				firstName: firstName || undefined,
				lastName: lastName || undefined,
				email: email || undefined,
				gender: gender || undefined,
				birth: birthOfDate(birth),
				country: country || undefined,
				profilePicture: haveProfilePicture(profilePicture),
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

		if (!updatedUserData)
			return ErrorHandler(
				'updateUserData is null',
				"Couldn't update user data",
				'Failed to update user data'
			);

		if (updatedUserData.error)
			return ErrorHandler(
				'prisma',
				updatedUserData.error,
				'Failed to update user data'
			);

		const { role, ...safeUser } = updatePassword;

		return { role, safeUser };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to update user data');
	}
};

export const deactivateUserAccount = async (userId) => {
	try {
		const deactivateUser = await UserModel.update({
			where: { id: userId },
			data: {
				isActive: false,
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

		if (!deactivateUser || deactivateUser.error)
			return ErrorHandler(
				'deactivate null or error',
				"Couldn't deactivated User Account" || deactivateUser.error,
				"Couldn't deactivated User Account"
			);

		return deactivateUser;
	} catch (error) {
		return ErrorHandler(
			"Couldn't deactivate",
			error,
			'Failed to deactivate User Account'
		);
	}
};

//* testing
// const body = {
// 	// "firstName": "Jafe",
// 	// "lastName": "Ron",
// 	// "username": "JaffRone14",
// 	// email: 'jaferr0n12@gmail.com',
// 	password: 'P@ssw0rd123',
// 	confirmPassword: "P@ssw0rd123",
// 	// "gender": "male",
// 	// "birth": "1998-02-08",
// 	// "country": "UK"
// };

// async function create() {
// 	try {
// 		const newUser = await resetUserPassword(body, "qweqweqwe");
// 		console.log(newUser);
// 	}

//     catch (error) {
// 		console.log('Failed to add user');
// 		console.error(error);
// 	}
// }
