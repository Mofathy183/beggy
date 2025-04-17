import { ErrorHandler } from '../utils/error.js';
import { hashingPassword, verifyPassword } from '../utils/hash.js';
import prisma from '../../prisma/prisma.js';
import { generateCryptoToken, generateCryptoHashToken } from '../utils/jwt.js';
import {
	setExpiredAt,
	passwordChangeAt,
	birthOfDate,
	haveProfilePicture,
} from '../utils/userHelper.js';

export const singUpUser = async (body) => {
	try {
		const { firstName, lastName, email, password, confirmPassword } = body;

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
			include: {
				account: true,
				suitcases: {
					include: {
						suitcaseItems: {
							include: {
								item: true,
							},
						},
					},
				},
				bags: {
					include: {
						bagItems: {
							include: {
								item: true,
							},
						},
					},
				},
			},
		});

		if (!newUser)
			throw new ErrorHandler(
				'prisma',
				'No user created',
				'Failed to create user'
			);

		if (newUser.error)
			return new ErrorHandler(
				'prisma',
				newUser.error,
				'User already exists ' + newUser.error.message
			);

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
			new ErrorHandler(
				'prisma',
				user.error,
				'User not found ' + user.error.message
			);

		// Check if password matches
		const isPasswordMatch = await verifyPassword(password, userPassword);

		if (!isPasswordMatch)
			return new ErrorHandler(
				'password',
				'Incorrect Password',
				'Incorrect password'
			);

		//? Check if user is deActive (isActive is false)
		//* to make it isActive to true
		if (!isActive) {
			prisma.user.update({
				where: { id: user.id },
				data: { isActive: true },
			});
		}

		return { role: role, safeUser: safeUser };
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
			return new ErrorHandler(
				'prisma',
				user.error,
				'User not found ' + user.error.message
			);

		//* Generate a random password by crypto
		const { token, hashToken } = generateCryptoHashToken();

		//* get the reset expired token date, than add it to database.
		const resetExpiredAt = setExpiredAt("password");

		const updateUser = await prisma.user.update({
			where: { id: user.id },
			data: {
				passwordResetToken: hashToken,
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
				'Failed to update user password reset token and expired at ' +
					updateUser.error.message
			);

		//* return reset token to send an email
		return {
			token,
			userName: updateUser.displayName,
			userEmail: updateUser.email,
		};
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

        const user = await prisma.user.findUnique({
            where: {
                passwordResetToken: hashedToken,
            },
        });
        
        if (!user) {
            return next(
                new ErrorHandler(
                    'Invalid token',
                    'Password reset token is invalid',
                    "Can't reset password with invalid token"
                )
            );
        }

		if (user.error)
			return new ErrorHandler(
				'prisma',
				user.error,
				'User not found ' + user.error.message
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
				passwordChangeAt: true,
				passwordResetExpiredAt: true,
				passwordResetToken: true,
				isActive: true,
			},
		});

		if (!updatePassword)
			return new ErrorHandler(
				'user is null',
				'Failed to update user password',
				'Failed to update user password'
			);

		if (updatePassword.error)
			return new ErrorHandler(
				'prisma',
				updatePassword.error,
				'Failed to update user password ' + updatePassword.error.message
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

export const updateUserPassword = async (userId, body) => {
	try {
		const { currentPassword, newPassword, confirmPassword } = body;

		const userPassword = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				password: true,
				passwordChangeAt: true,
			},
		});

		if (!userPassword)
			return new ErrorHandler(
				'user is null',
				'User not found',
				'User not found'
			);

		if (userPassword.error)
			return new ErrorHandler(
				'prisma',
				userPassword.error,
				'User not found ' + userPassword.error.message
			);

		const isMatch = await verifyPassword(
			currentPassword,
			userPassword.password
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
				'Failed to update user password ' + updatePassword.error.message
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
				'Failed to update user data ' + updatedUserData.error.message
			);

		return updatedUserData;
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to update user data');
	}
};


export const sendVerificationUserEmail = async (email) => {
    try {
        const user = await prisma.user.findUnique({ where: { email: email } });

        if (!user) return new ErrorHandler(
            'user',
            'There is no user with that email',
            'User not found'
        );
        
        if (user.error) return new ErrorHandler(
            'prisma',
            user.error,
            'User not found ' + user.error.message
        );

        const { token, hashToken } = generateCryptoHashToken();

        const expiredAt = setExpiredAt("email");

        const updateUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerifyToken: hashToken,
                emailTokenExpiresAt: expiredAt,
            }
        });

        if (!updateUser)
            return new ErrorHandler(
                'updateUser is null',
                "Couldn't update user",
                'Failed to update user'
            );

        if (updateUser.error)
            return new ErrorHandler(
                'prisma',
                updateUser.error,
                'Failed to update user ' + updateUser.error.message
            );
        
        return { token, userName: user.displayName }
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            'Failed to verify user email'
        )
    }
}

export const deactivateUserAccount = async (userId) => {
	try {
		const deactivateUser = await prisma.user.update({
			where: { id: userId },
			data: {
				isActive: false,
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				passwordResetExpiredAt: true,
				passwordResetToken: true,
				role: true,
			},
		});

		if (!deactivateUser)
			return new ErrorHandler(
				'deactivateUser is null',
				"Couldn't deactivate user",
				'Failed to deactivate User Account'
			);

		if (deactivateUser.error)
			return new ErrorHandler(
				'prisma',
				deactivateUser.error,
				'Failed to deactivate user ' + deactivateUser.error.message
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


async function name() {
    const { token, hashToken } = generateCryptoHashToken();
    const expiredAt = setExpiredAt();

    // ✅ First, register a new user before sending a password reset link
    const user = await prisma.user.create({
        data: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'testuser44@test.com',
            password: await hashingPassword('testing123'),
            passwordResetToken: hashToken,
            passwordResetExpiredAt: expiredAt,
        },
    });
    const kk = await resetUserPassword({ password: 'testing12377@', confirmPassword: 'testing12377@' }, token);

    return console.log(kk)
}

await name()