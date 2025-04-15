import { ErrorHandler } from '../utils/error.js';
import prisma from '../../prisma/prisma.js';

//*======================================={Bags Public Route}==============================================

export const findAllBagsByQuery = async (searchFilter, pagination, orderBy) => {
	try {
		const { page, limit, offset } = pagination;

		const bags = await prisma.bags.findMany({
			where: searchFilter,
			omit: {
				user: true,
				userId: true,
				bagItems: true,
			},
			take: limit,
			skip: offset,
			orderBy: orderBy,
		});

		if (bags.error)
			return new ErrorHandler(
				'prisma',
				bags.error,
				'Failed to find bags in the database ' + bags.error.message
			);

		const totalCount = await prisma.bags.count();

		const meta = {
			totalCount: totalCount,
			totalFind: bags.length,
			page: page,
			limit: limit,
			searchFilter: searchFilter,
			orderBy: orderBy,
		};

		return { bags, meta };
	} catch (error) {
		new ErrorHandler('catch', error, 'Failed to get all bags');
	}
};

export const findBagById = async (bagId) => {
	try {
		const bag = await prisma.bags.findUnique({
			where: { id: bagId },
			omit: {
				user: true,
				userId: true,
				bagItems: true,
			},
		});

		if (!bag)
			return new ErrorHandler(
				'bag not found',
				'Failed to find bag in the database',
				'prisma Error'
			);

		if (bag.error)
			return new ErrorHandler(
				'prisma',
				bag.error,
				'Failed to find bag in the database ' + bag.error.message
			);

		return bag;
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to get bag by id');
	}
};

//*======================================={Bags Public Route}==============================================

//*======================================={Items Public Route}==============================================

export const findItemById = async (itemId) => {
	try {
		const item = await prisma.items.findUnique({
			where: { id: itemId },
			omit: {
				userId: true,
				user: true,
			},
		});

		if (!item)
			return new ErrorHandler(
				'item',
				'Item not found',
				'Item not found in the database'
			);

		if (item.error)
			return new ErrorHandler(
				'prisma',
				'Failed to find item in the database ' + item.error,
				'Failed to find item in the database ' + item.error.message
			);

		return item;
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to find item by id');
	}
};

export const findItemsByQuery = async (pagination, searchFilter, orderBy) => {
	try {
		const { page, limit, offset } = pagination;

		const items = await prisma.items.findMany({
			where: searchFilter,
			omit: {
				userId: true,
				user: true,
			},
			take: limit,
			skip: offset,
			orderBy: orderBy,
		});

		if (items.error)
			return new ErrorHandler(
				'prisma',
				items.error || 'Failed to find items in the database',
				'Failed to find items in the database'
			);

		const totalCount = await prisma.items.count();

		const meta = {
			totalCount: totalCount,
			totalFind: items.length,
			page: page,
			limit: limit,
			searchFilter: searchFilter,
			orderBy: orderBy,
		};

		return { meta: meta, items: items };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to find items by query'
		);
	}
};

//*======================================={Items Public Route}==============================================

//*======================================={Suitcase Public Route}==============================================

export const findAllSuitcasesByQuery = async (
	searchFilter,
	pagination,
	orderBy
) => {
	try {
		const { page, limit, offset } = pagination;

		const suitcases = await prisma.suitcases.findMany({
			where: searchFilter,
			omit: {
				user: true,
				userId: true,
				suitcaseItems: true,
			},
			take: limit,
			skip: offset,
			orderBy: orderBy,
		});

		if (suitcases.error)
			return new ErrorHandler(
				'prisma',
				suitcases.error,
				'Failed to find suitcases in the database ' +
					suitcases.error.message
			);

		const totalCount = await prisma.suitcases.count();

		const meta = {
			totalCount: totalCount,
			totalFind: suitcases.length,
			page: page,
			limit: limit,
			searchFilter: searchFilter,
			orderBy: orderBy,
		};

		return { meta: meta, suitcases: suitcases };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to find all suitcases');
	}
};

export const findSuitcaseById = async (suitcaseId) => {
	try {
		const suitcase = await prisma.suitcases.findUnique({
			where: { id: suitcaseId },
			omit: {
				user: true,
				userId: true,
				suitcaseItems: true,
			},
		});

		if (!suitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (suitcase.error)
			return new ErrorHandler(
				'prisma',
				suitcase.error,
				'Failed to find suitcase in the database ' +
					suitcase.error.message
			);

		return suitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to find suitcase by id'
		);
	}
};

//*======================================={Suitcase Public Route}==============================================

//*======================================={Users Public Route}==============================================

export const findAllUsers = async (pagination, searchFilter, orderBy) => {
	try {
		const { page, limit, offset } = pagination;

		const users = await prisma.user.findMany({
			where: { OR: searchFilter },
			omit: {
				suitcases: true,
				bags: true,
				items: true,
				account: true,
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

export const findUserPublicProfile = async (userId) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId, // Only return active users
				AND: {
					isActive: true,
				},
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
				defaultProfilePicture: true,
			},
		});

		if (!user)
			return new ErrorHandler(
				'user',
				'User not found',
				'User not found in the database'
			);

		if (user.error)
			return new ErrorHandler(
				'prisma',
				user.error,
				'User not found in the database ' + user.error.message
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

//*======================================={Users Public Route}==============================================
