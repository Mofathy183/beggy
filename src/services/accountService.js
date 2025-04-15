import prisma from '../../prisma/prisma.js';
import { generateHashPassword } from '../utils/hash.js';
import { birthOfDate, haveProfilePicture } from '../utils/userHelper.js';
import { ErrorHandler } from '../utils/error.js';

export const loginUserWithGoogle = async (profile) => {
	try {
		const { id, name, emails, photos, provider } = profile;
		const { value: email, verified } = emails[0];
		const { familyName: lastName, givenName: firstName } = name;
		const { value: photo } = photos[0];

		const user = await prisma.user.upsert({
			where: { email },
			update: {},
			create: {
				firstName,
				lastName,
				email,
				isEmailVerified: verified,
				password: generateHashPassword(),
				profilePicture: haveProfilePicture(photo),
				account: {
					create: {
						provider,
						providerId: id,
					},
				},
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				passwordResetExpiredAt: true,
				passwordResetToken: true,
				verifyToken: true,
			},
		});

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
				'Could not create user ' + user.error.message
			);

		const { role, ...safeUser } = user;

		return { role, safeUser };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'An error occurred while trying to Login with Google'
		);
	}
};

export const loginUserWithFacebook = async (profile) => {
	try {
		const { id, provider, emails, name, photos, _json } = profile;
		const { birthday, gender } = _json;
		const { givenName: firstName, familyName: lastName } = name;
		const { value: photo } = photos[0];
		const { value: email = undefined } = emails[0];

		if (!email)
			return {
				emailError:
					'Email is required to sign up with Facebook.' +
					'Please ensure your Facebook account has a valid email.',
			};

		const user = await prisma.user.upsert({
			where: { email },
			update: {},
			create: {
				firstName,
				lastName,
				email,
				isEmailVerified: true,
				password: generateHashPassword(),
				birth: birthOfDate(birthday),
				gender,
				profilePicture: haveProfilePicture(photo),
				account: {
					create: {
						provider,
						providerId: id,
					},
				},
			},
			omit: {
				password: true,
				passwordChangeAt: true,
				passwordResetExpiredAt: true,
				passwordResetToken: true,
				verifyToken: true,
			},
		});

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
				'Could not create user ' + user.error.message
			);

		const { role, ...safeUser } = user;

		return { role, safeUser };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'An error occurred while trying to Login with Facebook'
		);
	}
};
