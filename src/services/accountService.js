import { AccountModel, UserModel } from '../../prisma/prisma.js';
import { generateFakePassword } from '../utils/authHelper.js';
import { birthOfDate, haveProfilePicture } from '../utils/userHelper.js';
import { ErrorHandler } from '../utils/error.js';

export const authenticateUserWithGoogle = async (profile) => {
	try {
		const { id, name, emails, photos, provider } = profile;
		const { value: email } = emails[0];
		const { familyName: lastName, givenName: firstName } = name;
		const { value: photo } = photos[0];

		let user = await AccountModel.findUnique({
			where: { providerId: id },
			select: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						gender: true,
						country: true,
						birth: true,
						profilePicture: true,
						role: true,
						suitcases: true,
						bags: true,
						items: true,
					},
				},
				id: true,
				provider: true,
				providerId: true,
				userId: true,
			},
		});

		if (!user) {
			user = await UserModel.create({
				data: {
					firstName,
					lastName,
					email,
					password: generateFakePassword(),
					profilePicture: photo,
					account: {
						// Creating account inside User creation
						create: {
							provider: provider,
							providerId: id,
						},
					},
				},
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					profilePicture: true,
					role: true,
					account: true,
				},
			});
		}

		return user;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'An error occurred while trying to authenticate with Google'
		);
	}
};

export const authenticateUserWithFacebook = async (profile) => {
	try {
		const { id, provider, emails, name, photos, _json } = profile;
		const { birthday, gender } = _json;
		const { givenName: firstName, familyName: lastName } = name;
		const { value: photo } = photos[0];
		const email = emails[0].value || undefined;

		let user = await AccountModel.findUnique({
			where: { providerId: id },
			select: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						gender: true,
						country: true,
						birth: true,
						profilePicture: true,
						role: true,
						suitcases: true,
						bags: true,
						items: true,
					},
				},
				id: true,
				provider: true,
				providerId: true,
				userId: true,
			},
		});

		if (!user) {
			user = await UserModel.create({
				data: {
					firstName,
					lastName,
					email,
					password: generateFakePassword(),
					profilePicture: haveProfilePicture(photo),
					gender: gender,
					birth: birthOfDate(birthday),
					account: {
						// Creating account inside User creation
						create: {
							provider: provider,
							providerId: id,
						},
					},
				},
				select: {
					id: true,
					firstName: true,
					lastName: true,
					email: true,
					profilePicture: true,
					role: true,
					gender: true,
					birth: true,
					account: true,
				},
			});
		}

		return user;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'An error occurred while trying to authenticate with Facebook'
		);
	}
};
