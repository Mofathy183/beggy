// import { ErrorHandler } from '../utils/error.js';
// import type { PrismaClient } from '../generated/client/index.js';
// import prisma from '../../prisma/prisma.js';
// import { statusCode } from '../config/status.js';

// //*======================================={BAG ME Route}==============================================

// /**
//  * @function findBagsUserHas
//  * @description Fetches the list of bags associated with a specific user, based on filters, pagination, and sorting criteria.
//  * @param {string} userId - The ID of the user whose bags are being retrieved.
//  * @param {Object} searchFilter - Filtering conditions for the bag search.
//  * @param {Object} pagination - Contains page number, limit, and offset for paginated results.
//  * @param {Object} orderBy - Criteria to sort the results.
//  * @returns {Promise<Object>} An object containing the user's bags and metadata, or an error if the operation fails.
//  */
// export const findBagsUserHas = async (
// 	userId,
// 	searchFilter,
// 	pagination,
// 	orderBy
// ) => {
// 	try {
// 		const { page, limit, offset } = pagination;

// 		const userBags = await prisma.bags.findMany({
// 			where: { userId: userId, ...searchFilter },
// 			select: {
// 				id: true,
// 				name: true,
// 				type: true,
// 				color: true,
// 				size: true,
// 				capacity: true,
// 				maxWeight: true,
// 				weight: true,
// 				material: true,
// 				features: true,
// 				userId: true,
// 				user: {
// 					select: {
// 						id: true,
// 						firstName: true,
// 						lastName: true,
// 						displayName: true,
// 						birth: true,
// 						age: true,
// 					},
// 				},
// 				bagItems: true,
// 			},
// 			skip: offset,
// 			take: limit,
// 			orderBy: orderBy,
// 		});

// 		if (!userBags)
// 			return new ErrorHandler(
// 				'bags not found',
// 				'Failed to find bags in the database',
// 				'Could not find bags for the user',
// 				statusCode.notFoundCode
// 			);

// 		if (userBags.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				userBags.error,
// 				'Failed to find bags in the database ' + userBags.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const totalCount = await prisma.bags.count({
// 			where: { userId: userId },
// 		});

// 		const meta = {
// 			totalCount: totalCount,
// 			totalFind: userBags.length,
// 			page: page,
// 			limit: limit,
// 			offset: offset,
// 			searchFilter: searchFilter,
// 			orderBy: orderBy,
// 		};

// 		return { userBags: userBags, meta: meta };
// 	} catch (error) {
// 		new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Getting Your Bags'
// 				: error,
// 			'Failed to get bags user has',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function findBagUserHasById
//  * @description Retrieves a specific bag owned by a user based on the bag's ID.
//  * @param {string} userId - The ID of the user who owns the bag.
//  * @param {string} bagId - The ID of the bag to retrieve.
//  * @returns {Promise<Object>} The bag details and metadata, or an error if the operation fails.
//  */
// export const findBagUserHasById = async (userId, bagId) => {
// 	try {
// 		const userBag = await prisma.bags.findUnique({
// 			where: { userId: userId, id: bagId },
// 			select: {
// 				id: true,
// 				name: true,
// 				type: true,
// 				color: true,
// 				size: true,
// 				capacity: true,
// 				maxWeight: true,
// 				weight: true,
// 				material: true,
// 				features: true,
// 				userId: true,
// 				user: {
// 					select: {
// 						id: true,
// 						firstName: true,
// 						lastName: true,
// 						displayName: true,
// 						age: true,
// 					},
// 				},
// 				bagItems: true,
// 			},
// 		});

// 		if (!userBag)
// 			return new ErrorHandler(
// 				'bag not found',
// 				'Failed to find bag in the database',
// 				'Could not find bag for the user',
// 				statusCode.notFoundCode
// 			);

// 		if (userBag.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				userBag.error,
// 				'Failed to find bag in the database',
// 				statusCode.internalServerErrorCode
// 			);

// 		const totalCount = await prisma.bags.count({
// 			where: { userId: userId },
// 		});

// 		const meta = {
// 			totalCount: totalCount,
// 			totalFind: userBag ? 1 : 0,
// 		};

// 		return { userBag: userBag, meta: meta };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Getting Your Bag By Id'
// 				: error,
// 			'Failed to get bag user has by id',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function addBagToUser
//  * @description Adds a new bag for a user with the specified details.
//  * @param {string} userId - The ID of the user to whom the bag is being added.
//  * @param {Object} body - Contains bag details such as name, type, color, size, etc.
//  * @returns {Promise<Object>} The newly created bag and metadata, or an error if the operation fails.
//  */
// export const addBagToUser = async (userId, body) => {
// 	try {
// 		const {
// 			name,
// 			type,
// 			color,
// 			size,
// 			capacity,
// 			maxWeight,
// 			weight,
// 			material,
// 			features,
// 		} = body;

// 		const newBag = await prisma.bags.create({
// 			data: {
// 				name: name,
// 				type: type,
// 				color: color,
// 				size: size,
// 				capacity: capacity,
// 				maxWeight: maxWeight,
// 				weight: weight,
// 				material: material,
// 				features: features,
// 				userId: userId,
// 			},
// 			select: {
// 				id: true,
// 				name: true,
// 				type: true,
// 				color: true,
// 				size: true,
// 				capacity: true,
// 				maxWeight: true,
// 				weight: true,
// 				material: true,
// 				features: true,
// 				userId: true,
// 				user: {
// 					select: {
// 						id: true,
// 						firstName: true,
// 						lastName: true,
// 						displayName: true,
// 						birth: true,
// 						age: true,
// 					},
// 				},
// 				bagItems: {
// 					include: {
// 						item: true,
// 					},
// 				},
// 			},
// 		});

// 		if (!newBag)
// 			return new ErrorHandler(
// 				'bag not created',
// 				'Failed to create bag in the database',
// 				'Could not create bag for the user',
// 				statusCode.badRequestCode
// 			);

// 		if (newBag.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				newBag.error,
// 				'Failed to create bag in the database ' + newBag.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const totalCount = await prisma.bags.count({
// 			where: { userId: userId },
// 		});

// 		const meta = {
// 			totalCount: totalCount,
// 			totalCreate: newBag ? 1 : 0,
// 		};

// 		return { meta: meta, newBag: newBag };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Making Your New Bag'
// 				: error,
// 			'Failed to add bag to user'
// 		);
// 	}
// };

// /**
//  * @function replaceBagUserHas
//  * @description Replaces the details of an existing bag owned by a user.
//  * @param {string} userId - The ID of the user who owns the bag.
//  * @param {string} bagId - The ID of the bag to be replaced.
//  * @param {Object} body - New data to update the bag.
//  * @returns {Promise<Object>} The updated bag details, or an error if the operation fails.
//  */
// export const replaceBagUserHas = async (userId, bagId, body) => {
// 	try {
// 		const {
// 			name,
// 			type,
// 			color,
// 			size,
// 			capacity,
// 			maxWeight,
// 			weight,
// 			material,
// 			features,
// 		} = body;

// 		const updatedBag = await prisma.bags.update({
// 			where: { userId: userId, id: bagId },
// 			data: {
// 				name: name,
// 				type: type,
// 				color: color,
// 				size: size,
// 				capacity: capacity,
// 				maxWeight: maxWeight,
// 				weight: weight,
// 				material: material,
// 				features: features,
// 			},
// 			include: {
// 				bagItems: {
// 					select: {
// 						item: true,
// 					},
// 				},
// 			},
// 		});

// 		if (!updatedBag)
// 			return new ErrorHandler(
// 				'bag not updated',
// 				'Failed to update bag in the database',
// 				'Could not update bag for the user',
// 				statusCode.badRequestCode
// 			);

// 		if (updatedBag.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				updatedBag.error,
// 				'Failed to update bag in the database ' +
// 					updatedBag.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		return updatedBag;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Replacing Your Bag'
// 				: error,
// 			'Failed to replace bag user has',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function modifyBagUserHas
//  * @description Modifies specific fields of a bag owned by a user, with support for feature additions and removals.
//  * @param {string} userId - The ID of the user who owns the bag.
//  * @param {string} bagId - The ID of the bag to be modified.
//  * @param {Object} body - Partial fields to update, including features to add or remove.
//  * @returns {Promise<Object>} The modified bag details, or an error if the operation fails.
//  */
// export const modifyBagUserHas = async (userId, bagId, body) => {
// 	try {
// 		const {
// 			name,
// 			type,
// 			color,
// 			size,
// 			capacity,
// 			maxWeight,
// 			weight,
// 			material,
// 			features,
// 			removeFeatures,
// 		} = body;

// 		const bag = await prisma.bags.findUnique({
// 			where: { id: bagId, userId: userId },
// 			select: {
// 				userId: true,
// 				features: true,
// 			},
// 		});

// 		if (!bag)
// 			return new ErrorHandler(
// 				'bag not found',
// 				'Failed to find bag in the database',
// 				'Could not find bag for the user',
// 				statusCode.notFoundCode
// 			);

// 		if (bag.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				bag.error,
// 				'Failed to find bag in the database ' + bag.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		// Normalize `removeFeatures` for case-insensitive matching
// 		const removeSet = [
// 			...new Set([...removeFeatures.map((f) => f.toUpperCase())]),
// 		];

// 		// Filter out features that need to be removed
// 		const newFeatures =
// 			bag.features?.filter((f) => !removeSet.includes(f.toUpperCase())) ||
// 			[];

// 		// Convert `features` to uppercase to match `bag.features`
// 		const updatedFeatures = [
// 			...new Set([
// 				...features.map((f) => f.toUpperCase()),
// 				...newFeatures,
// 			]),
// 		];

// 		const updatedBag = await prisma.bags.update({
// 			where: { userId: userId, id: bagId },
// 			data: {
// 				name: name || undefined,
// 				type: type || undefined,
// 				color: color || undefined,
// 				size: size || undefined,
// 				capacity: capacity || undefined,
// 				maxWeight: maxWeight || undefined,
// 				weight: weight || undefined,
// 				material: material || undefined,
// 				features:
// 					features.length || newFeatures.length
// 						? updatedFeatures
// 						: undefined,
// 			},
// 			include: {
// 				bagItems: {
// 					select: {
// 						item: true,
// 					},
// 				},
// 			},
// 		});

// 		if (!updatedBag)
// 			return new ErrorHandler(
// 				'bag not modified',
// 				'Failed to modify bag in the database',
// 				'Could not modify bag for the user',
// 				statusCode.badRequestCode
// 			);

// 		if (updatedBag.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				updatedBag.error,
// 				'Failed to modify bag in the database ' +
// 					updatedBag.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		return updatedBag;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Modifying Your Bag'
// 				: error,
// 			'Failed to modify bag user has',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function removeBagUserHasById
//  * @description Removes a specific bag owned by a user based on the bag's ID.
//  * @param {string} userId - The ID of the user who owns the bag.
//  * @param {string} bagId - The ID of the bag to delete.
//  * @returns {Promise<Object>} An object with metadata and the deleted bag details, or an error if the operation fails.
//  */
// export const removeBagUserHasById = async (userId, bagId) => {
// 	try {
// 		const deletedBag = await prisma.bags.delete({
// 			where: { userId: userId, id: bagId },
// 			select: {
// 				id: true,
// 				name: true,
// 			},
// 		});

// 		if (!deletedBag)
// 			return new ErrorHandler(
// 				'bag not deleted',
// 				'Failed to delete bag from the database',
// 				'Could not delete bag for the user',
// 				statusCode.notFoundCode
// 			);

// 		if (deletedBag.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				deletedBag.error,
// 				'Failed to delete bag from the database ' +
// 					deletedBag.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const totalCount = await prisma.bags.count({
// 			where: { userId: userId },
// 		});

// 		const meta = {
// 			totalCount: totalCount,
// 			totalDelete: deletedBag ? 1 : 0,
// 		};

// 		return { deletedBag: deletedBag, meta: meta };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Removing Your Bag'
// 				: error,
// 			'Failed to remove bag user has by id',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function removeAllBagsUserHas
//  * @description Deletes all bags associated with a user based on filtering criteria.
//  * @param {string} userId - The ID of the user whose bags are being deleted.
//  * @param {Object} searchFilter - Filtering conditions for bag deletion.
//  * @returns {Promise<Object>} Metadata of the deletion operation, or an error if the operation fails.
//  */
// export const removeAllBagsUserHas = async (userId, searchFilter) => {
// 	try {
// 		const deletedBags = await prisma.bags.deleteMany({
// 			where: {
// 				...searchFilter,
// 				userId: userId,
// 			},
// 		});

// 		if (deletedBags.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				deletedBags.error,
// 				'Failed to delete all bags from the database ' +
// 					deletedBags.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const totalCount = await prisma.bags.count({
// 			where: { userId: userId },
// 		});

// 		const meta = {
// 			totalCount: totalCount,
// 			totalDelete: deletedBags.count,
// 		};

// 		return { deletedBags: deletedBags, meta: meta };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Removing Your Bags By Filter'
// 				: error,
// 			'Failed to remove all bags user has',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };
// //*======================================={BAG ME Route}==============================================

// //*======================================={Bags Private Route}==============================================

// /**
//  * @function replaceBagResource
//  * @description Replaces the details of a bag resource identified by its ID.
//  * @param {string} bagId - The ID of the bag to be replaced.
//  * @param {Object} body - The new data for the bag, including name, type, color, size, capacity, maxWeight, weight, material, and features.
//  * @returns {Promise<Object>} The updated bag details, or an error if the operation fails.
//  */
// export const replaceBagResource = async (bagId, body) => {
// 	try {
// 		const {
// 			name,
// 			type,
// 			color,
// 			size,
// 			capacity,
// 			maxWeight,
// 			weight,
// 			material,
// 			features,
// 		} = body;

// 		const bagUpdate = await prisma.bags.update({
// 			where: { id: bagId },
// 			data: {
// 				name: name,
// 				type: type,
// 				color: color,
// 				size: size,
// 				capacity: capacity,
// 				maxWeight: maxWeight,
// 				weight: weight,
// 				material: material,
// 				features: features,
// 			},
// 		});

// 		if (!bagUpdate)
// 			return new ErrorHandler(
// 				'bag not found',
// 				'Failed to find bag in the database',
// 				'prisma Error',
// 				statusCode.notFoundCode
// 			);

// 		if (bagUpdate.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				bagUpdate.error,
// 				'Failed to update bag in the database ' +
// 					bagUpdate.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		return bagUpdate;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Replacing Bag'
// 				: error,
// 			'Failed to replace bag resource',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function modifyBagResource
//  * @description Modifies specific fields of a bag resource identified by its ID.
//  * @param {string} bagId - The ID of the bag to be modified.
//  * @param {Object} body - Partial fields to update, including name, type, color, size, capacity, maxWeight, weight, material, and features.
//  * @returns {Promise<Object>} The modified bag details, or an error if the operation fails.
//  */
// export const modifyBagResource = async (bagId, body) => {
// 	try {
// 		const {
// 			name,
// 			type,
// 			color,
// 			size,
// 			capacity,
// 			maxWeight,
// 			weight,
// 			material,
// 			features,
// 		} = body;

// 		const bagUpdate = await prisma.bags.update({
// 			where: { id: bagId },
// 			data: {
// 				name: name || undefined,
// 				type: type || undefined,
// 				color: color || undefined,
// 				size: size || undefined,
// 				capacity: capacity || undefined,
// 				maxWeight: maxWeight || undefined,
// 				weight: weight || undefined,
// 				material: material || undefined,
// 				features: features || undefined,
// 			},
// 		});

// 		if (!bagUpdate)
// 			return new ErrorHandler(
// 				'bag not found',
// 				'Failed to find bag in the database',
// 				'prisma Error',
// 				statusCode.notFoundCode
// 			);

// 		if (bagUpdate.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				bagUpdate.error,
// 				'Failed to update bag in the database ' +
// 					bagUpdate.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		return bagUpdate;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Modifying Bag'
// 				: error,
// 			'Failed to modify bag resource',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function removeBagById
//  * @description Deletes a specific bag resource from the database identified by its ID.
//  * @param {string} bagId - The ID of the bag to be deleted.
//  * @returns {Promise<Object>} An object containing the deleted bag details and metadata, or an error if the operation fails.
//  */
// export const removeBagById = async (bagId) => {
// 	try {
// 		const bagDelete = await prisma.bags.delete({
// 			where: { id: bagId },
// 			select: {
// 				id: true,
// 				name: true,
// 			},
// 		});

// 		if (!bagDelete)
// 			return new ErrorHandler(
// 				'bag not found',
// 				'Failed to find bag in the database',
// 				'prisma Error',
// 				statusCode.notFoundCode
// 			);

// 		if (bagDelete.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				bagDelete.error,
// 				'Failed to delete bag in the database ' +
// 					bagDelete.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const totalCount = await prisma.bags.count();

// 		const meta = {
// 			totalCount: totalCount,
// 			totalDelete: bagDelete ? 1 : 0,
// 		};

// 		return { bagDelete: bagDelete, meta: meta };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Removing Bag'
// 				: error,
// 			'Failed to remove bag by id',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function removeAllBags
//  * @description Deletes all bag resources from the database based on provided filtering criteria.
//  * @param {Object} searchFilter - Filtering conditions for the deletion operation.
//  * @returns {Promise<Object>} Metadata of the deletion operation, including the count of deleted bags, or an error if the operation fails.
//  */
// export const removeAllBags = async (searchFilter) => {
// 	try {
// 		const deleteCount = await prisma.bags.deleteMany({
// 			where: searchFilter,
// 		});

// 		if (deleteCount.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				deleteCount.error,
// 				'Failed to delete all bags from the database',
// 				statusCode.internalServerErrorCode
// 			);

// 		const meta = {
// 			totalCount: deleteCount.count,
// 			totalDelete: deleteCount.count,
// 			searchFilter,
// 		};

// 		return { deleteCount: deleteCount, meta: meta };
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Removing Bags By Filter'
// 				: error,
// 			'Failed to remove all bags'
// 		);
// 	}
// };

// //*======================================={Bags Private Route}==============================================

// //*======================================={Bags Public Route}==============================================

// /**
//  * @function findAllBagsByQuery
//  * @description Fetches a list of bags based on filtering criteria, pagination, and sorting options.
//  * @param {Object} searchFilter - Filtering conditions for the bags query.
//  * @param {Object} pagination - Contains page number, limit, and offset for paginated results.
//  * @param {Object} orderBy - Criteria to sort the results.
//  * @returns {Promise<Object>} An object containing the fetched bags and metadata, or an error if the operation fails.
//  */
// export const findAllBagsByQuery = async (searchFilter, pagination, orderBy) => {
// 	try {
// 		const { page, limit, offset } = pagination;

// 		const bags = await prisma.bags.findMany({
// 			where: searchFilter,
// 			omit: {
// 				user: true,
// 				userId: true,
// 				bagItems: true,
// 			},
// 			take: limit,
// 			skip: offset,
// 			orderBy: orderBy,
// 		});

// 		if (bags.error)
// 			return new ErrorHandler(
// 				'prisma Error',
// 				'Failed to find Bags in the database ' + bags.error,
// 				'Failed to find Bags in the database ' + bags.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		const totalCount = await prisma.bags.count();

// 		const meta = {
// 			totalCount: totalCount,
// 			totalFind: bags.length,
// 			page: page,
// 			limit: limit,
// 			searchFilter: searchFilter,
// 			orderBy: orderBy,
// 		};

// 		return { bags, meta };
// 	} catch (error) {
// 		new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Getting Bags By Filter'
// 				: error,
// 			'Failed to get all bags',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// /**
//  * @function findBagById
//  * @description Retrieves a specific bag resource from the database based on its ID.
//  * @param {string} bagId - The ID of the bag to retrieve.
//  * @returns {Promise<Object>} The details of the bag, or an error if the operation fails.
//  */
// export const findBagById = async (bagId) => {
// 	try {
// 		const bag = await prisma.bags.findUnique({
// 			where: { id: bagId },
// 			omit: {
// 				user: true,
// 				userId: true,
// 				bagItems: true,
// 			},
// 		});

// 		if (!bag)
// 			return new ErrorHandler(
// 				'bag not found',
// 				'Failed to find bag in the database',
// 				'Failed To Find Bag By Id',
// 				statusCode.notFoundCode
// 			);

// 		if (bag.error)
// 			return new ErrorHandler(
// 				'prisma',
// 				'Failed to find Bag in the database ' + bag.error,
// 				'Failed to find Bag in the database ' + bag.error.message,
// 				statusCode.internalServerErrorCode
// 			);

// 		return bag;
// 	} catch (error) {
// 		return new ErrorHandler(
// 			'catch',
// 			Object.keys(error).length === 0
// 				? 'Error Occur while Getting Bags By Id'
// 				: error,
// 			'Failed to get bag by id',
// 			statusCode.internalServerErrorCode
// 		);
// 	}
// };

// //*======================================={Bags Public Route}==============================================
