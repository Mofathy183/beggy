import { ErrorHandler } from '../utils/error.js';
import { hashingPassword, verifyPassword } from '../utils/hash.js';
import prisma from '../../prisma/prisma.js';
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
			email,
			password,
			confirmPassword,
		} = body;

		// Hashing the password
		if (password !== confirmPassword)
			throw new ErrorHandler(
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
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                displayName: true,
                email: true,
                city: true,
                country: true,
                birth: true,
                age: true,
                gender: true,
                profilePicture: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        if (!newUser) throw new ErrorHandler(
            'prisma',
            'No user created',
            'Failed to create user'
        )

        if (newUser.error) return new ErrorHandler(
            'prisma',
            newUser.error,
            'User already exists '+ newUser.error.message
        )

		const { role, ...safeUser } = newUser;

		return { role: role, safeUser: safeUser };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to sign up user');
	}
};

export const loginUser = async (body) => {
	try {
		const { email, password } = body;

		// Check if user exists
		const user = await prisma.user.findUnique({
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
			new ErrorHandler('prisma', user.error, 'User not found '+ user.error.message);

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
			prisma.user.update({
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
		const user = await prisma.user.findUnique({ where: { email: email } });

		if (!user)
			new ErrorHandler(
				'user',
				'There is no user with that email',
				'User not found'
			);

		if (user.error)
			return new ErrorHandler('prisma', user.error, 'User not found '+user.error.message);

		//* Generate a random password by crypto
		const { resetToken, hashResetToken } = generateResetToken();

		//* get the reset expired token date, than add it to database.
		const resetExpiredAt = resetPasswordExpiredAt();

		const updateUser = await prisma.user.update({
			where: { id: user.id },
			data: {
				passwordResetToken: hashResetToken,
				passwordResetExpiredAt: resetExpiredAt,
			},
		});

		if (!updateUser)
			return new ErrorHandler(
				'user is null',
				'Failed to update user password reset token and expired at',
				'Failed to update user password reset token and expired at'
			);

		if (updateUser.error)
			return new ErrorHandler(
				'prisma',
				updateUser.error,
				'Failed to update user password reset token and expired at '+updateUser.error.message
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
		const user = await prisma.user.findUnique({
			where: { passwordResetToken: hashedToken },
		});

		if (!user) return new ErrorHandler(
            'user is null',
            'invalid Reset Token',
            'token is invalid or expired'
        )

        if (user.error) return new ErrorHandler(
            'prisma',
            user.error,
            'User not found '+user.error.message
        )

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
		const updatePassword = await prisma.user.update({
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

        if (!updatePassword) return new ErrorHandler(
            'user is null',
            'Failed to update user password',
            'Failed to update user password'
        )

		if (updatePassword.error)
			return new ErrorHandler(
				'prisma',
				updatePassword.error,
				'Failed to update user password '+ updatePassword.error.message
			);

		return updatePassword;
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

		const userPaaword = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				password: true,
				passwordChangeAt: true,
			},
		});

		if (!userPaaword) return new ErrorHandler(
            'user is null',
            'User not found',
            'User not found'
        )

        if (updatePassword.error) return new ErrorHandler(
            'prisma',
            userPaaword.error,
            'User not found '+userPaaword.error.message
        )

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

		const updatePassword = await prisma.user.update({
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
				role: true,
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
				'Failed to update user password '+ updatePassword.error.message
			);

		return updatePassword;
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
            city,
			profilePicture,
		} = body;

		const updatedUserData = await prisma.user.update({
			where: { id: userId },
			data: {
				firstName: firstName || undefined,
				lastName: lastName || undefined,
				email: email || undefined,
				gender: gender || undefined,
				birth: birthOfDate(birth),
				country: country || undefined,
				city: city || undefined,
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
				role: true,
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
				'Failed to update user data '+updatedUserData.error.message
			);

		return updatedUserData;
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to update user data');
	}
};

export const deactivateUserAccount = async (userId) => {
	try {
		const deactivateUser = await prisma.user.update({
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
			},
		});

		if (!deactivateUser) return new ErrorHandler(
            'deactivateUser is null',
            "Couldn't deactivate user",
            'Failed to deactivate User Account'
        )

        if (deactivateUser.error) return new ErrorHandler(
            'prisma',
            deactivateUser.error,
            'Failed to deactivate user '+deactivateUser.error.message
        )

		return deactivateUser;
	} catch (error) {
		return ErrorHandler(
			"Couldn't deactivate",
			error,
			'Failed to deactivate User Account'
		);
	}
};

