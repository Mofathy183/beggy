import { ErrorHandler } from '../utils/error.js';
import type { PrismaClient } from '../generated/client/index.js';
import prisma from '../../prisma/prisma.js';
import { statusCode } from '../config/status.js';

//*======================================={Bags Public Route}==============================================

/**
 * @function findAllBagsByQuery
 * @description Fetches a list of bags based on filtering criteria, pagination, and sorting options.
 * @param {Object} searchFilter - Filtering conditions for the bags query.
 * @param {Object} pagination - Contains page number, limit, and offset for paginated results.
 * @param {Object} orderBy - Criteria to sort the results.
 * @returns {Promise<Object>} An object containing the fetched bags and metadata, or an error if the operation fails.
 */
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
				'prisma Error',
				'Failed to find Bags in the database ' + bags.error,
				'Failed to find Bags in the database ' + bags.error.message,
				statusCode.internalServerErrorCode
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
		new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Getting Bags By Filter'
				: error,
			'Failed to get all bags',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function findBagById
 * @description Retrieves a specific bag resource from the database based on its ID.
 * @param {string} bagId - The ID of the bag to retrieve.
 * @returns {Promise<Object>} The details of the bag, or an error if the operation fails.
 */
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
				'Failed To Find Bag By Id',
				statusCode.notFoundCode
			);

		if (bag.error)
			return new ErrorHandler(
				'prisma',
				'Failed to find Bag in the database ' + bag.error,
				'Failed to find Bag in the database ' + bag.error.message,
				statusCode.internalServerErrorCode
			);

		return bag;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Getting Bags By Id'
				: error,
			'Failed to get bag by id',
			statusCode.internalServerErrorCode
		);
	}
};

//*======================================={Bags Public Route}==============================================

//*======================================={Items Public Route}==============================================

/**
 * @function findItemById
 * @description Retrieves a specific item resource from the database based on its ID. Omits sensitive fields such as user data.
 * @param {string} itemId - The ID of the item to retrieve.
 * @returns {Promise<Object>} The details of the item, or an error if the operation fails.
 */
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
				'Item not found in the database',
				statusCode.notFoundCode
			);

		if (item.error)
			return new ErrorHandler(
				'prisma',
				'Failed to find item in the database ' + item.error,
				'Failed to find item in the database ' + item.error.message,
				statusCode.internalServerErrorCode
			);

		return item;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Getting Item By Id'
				: error,
			'Failed to find item by id',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function findItemsByQuery
 * @description Fetches a list of items based on filtering criteria, pagination, and sorting options. Omits sensitive fields such as user data.
 * @param {Object} pagination - Contains page number, limit, and offset for paginated results.
 * @param {Object} searchFilter - Filtering conditions for the items query.
 * @param {Object} orderBy - Criteria to sort the results.
 * @returns {Promise<Object>} An object containing the fetched items and metadata, or an error if the operation fails.
 */
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
				'Failed to find items in the database ' + items.error,
				'Failed to find items in the database ' + items.error.message,
				statusCode.internalServerErrorCode
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
			Object.keys(error).length === 0
				? 'Error Occur while Getting Items By Filter'
				: error,
			'Failed to find items by query',
			statusCode.internalServerErrorCode
		);
	}
};

//*======================================={Items Public Route}==============================================

//*======================================={Suitcase Public Route}==============================================

/**
 * @function findItemById
 * @description Retrieves a specific item resource from the database based on its ID.
 * @param {string} itemId - The ID of the item to retrieve.
 * @returns {Promise<Object>} The details of the item, or an error if the operation fails.
 */
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
				'Failed to find suitcases in the database ' + suitcases.error,
				'Failed to find suitcases in the database ' +
					suitcases.error.message,
				statusCode.internalServerErrorCode
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
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Getting Suitcases By Filter'
				: error,
			'Failed to find all suitcases',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function findItemsByQuery
 * @description Fetches a list of items based on filtering criteria, pagination, and sorting options.
 * @param {Object} pagination - Contains page number, limit, and offset for paginated results.
 * @param {Object} searchFilter - Filtering conditions for the items query.
 * @param {Object} orderBy - Criteria to sort the results.
 * @returns {Promise<Object>} An object containing the fetched items and metadata, or an error if the operation fails.
 */
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
				'prisma Error',
				'Failed to find suitcase in the database',
				statusCode.notFoundCode
			);

		if (suitcase.error)
			return new ErrorHandler(
				'prisma',
				'Failed to find suitcase in the database ' + suitcase.error,
				'Failed to find suitcase in the database ' +
					suitcase.error.message,
				statusCode.internalServerErrorCode
			);

		return suitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Getting Suitcase By Id'
				: error,
			'Failed to find suitcase by id',
			statusCode.internalServerErrorCode
		);
	}
};

//*======================================={Suitcase Public Route}==============================================

//*======================================={Users Public Route}==============================================

/**
 * @function findAllUsers
 * @description Retrieves a paginated list of users based on filtering criteria and sorting options, omitting sensitive or unnecessary fields.
 * @param {Object} pagination - Contains page number, limit, and offset for paginated results.
 * @param {Object} searchFilter - Filtering conditions for the user query (supports logical OR operations).
 * @param {Object} orderBy - Criteria to sort the results.
 * @returns {Promise<Object>} An object containing the fetched users and metadata, or an error if the operation fails.
 */
export const findAllUsers = async (pagination, searchFilter, orderBy) => {
	try {
		const { page, limit, offset } = pagination;

		const users = await prisma.user.findMany({
			where: searchFilter,
			omit: {
				suitcases: true,
				bags: true,
				items: true,
				account: true,
				password: true,
				passwordChangeAt: true,
			},
			skip: offset,
			take: limit,
			orderBy: orderBy,
		});

		if (!users)
			return new ErrorHandler(
				'user',
				'No users found',
				'No users found in the database',
				statusCode.notFoundCode
			);

		if (users.error)
			return new ErrorHandler(
				'prisma',
				'No users found ' + users.error,
				'No users found in the database ' + users.error.message,
				statusCode.internalServerErrorCode
			);

		const totalUsers = await prisma.user.count({
			where: { isActive: true },
		});

		if (totalUsers.error)
			return new ErrorHandler(
				'Total users null',
				'No users found' || totalUsers.error,
				'No users found in the database',
				statusCode.internalServerErrorCode
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
			Object.keys(error).length === 0
				? 'Error Occur while Getting Users By Search'
				: error,
			'Failed to get all users',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function findUserPublicProfile
 * @description Retrieves the public profile of a specific user based on their ID, ensuring the user is active.
 * @param {string} userId - The ID of the user whose public profile is being retrieved.
 * @returns {Promise<Object>} The public profile details of the user, or an error if the operation fails.
 */
export const findUserPublicProfile = async (userId) => {
	try {
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
				AND: {
					isActive: true, // Only return active users
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
				'User not found in the database',
				statusCode.notFoundCode
			);

		if (user.error)
			return new ErrorHandler(
				'prisma',
				'something went wrong ' + user.error,
				'User not found in the database ' + user.error.message
			);

		return user;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Getting User By Id'
				: error,
			'Failed to get user public profile',
			statusCode.internalServerErrorCode
		);
	}
};

//*======================================={Users Public Route}==============================================
