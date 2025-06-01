import { ErrorHandler } from '../utils/error.js';
import prisma from '../../prisma/prisma.js';
import { statusCode } from '../config/status.js';

//*======================================={Bags Private Route}==============================================

/**
 * @function replaceBagResource
 * @description Replaces the details of a bag resource identified by its ID.
 * @param {string} bagId - The ID of the bag to be replaced.
 * @param {Object} body - The new data for the bag, including name, type, color, size, capacity, maxWeight, weight, material, and features.
 * @returns {Promise<Object>} The updated bag details, or an error if the operation fails.
 */
export const replaceBagResource = async (bagId, body) => {
	try {
		const {
			name,
			type,
			color,
			size,
			capacity,
			maxWeight,
			weight,
			material,
			features,
		} = body;

		const bagUpdate = await prisma.bags.update({
			where: { id: bagId },
			data: {
				name: name,
				type: type,
				color: color,
				size: size,
				capacity: capacity,
				maxWeight: maxWeight,
				weight: weight,
				material: material,
				features: features,
			},
		});

		if (!bagUpdate)
			return new ErrorHandler(
				'bag not found',
				'Failed to find bag in the database',
				'prisma Error',
				statusCode.notFoundCode
			);

		if (bagUpdate.error)
			return new ErrorHandler(
				'prisma',
				bagUpdate.error,
				'Failed to update bag in the database ' +
					bagUpdate.error.message,
				statusCode.internalServerErrorCode
			);

		return bagUpdate;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Replacing Bag'
				: error,
			'Failed to replace bag resource',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function modifyBagResource
 * @description Modifies specific fields of a bag resource identified by its ID.
 * @param {string} bagId - The ID of the bag to be modified.
 * @param {Object} body - Partial fields to update, including name, type, color, size, capacity, maxWeight, weight, material, and features.
 * @returns {Promise<Object>} The modified bag details, or an error if the operation fails.
 */
export const modifyBagResource = async (bagId, body) => {
	try {
		const {
			name,
			type,
			color,
			size,
			capacity,
			maxWeight,
			weight,
			material,
			features,
		} = body;

		const bagUpdate = await prisma.bags.update({
			where: { id: bagId },
			data: {
				name: name || undefined,
				type: type || undefined,
				color: color || undefined,
				size: size || undefined,
				capacity: capacity || undefined,
				maxWeight: maxWeight || undefined,
				weight: weight || undefined,
				material: material || undefined,
				features: features || undefined,
			},
		});

		if (!bagUpdate)
			return new ErrorHandler(
				'bag not found',
				'Failed to find bag in the database',
				'prisma Error',
				statusCode.notFoundCode
			);

		if (bagUpdate.error)
			return new ErrorHandler(
				'prisma',
				bagUpdate.error,
				'Failed to update bag in the database ' +
					bagUpdate.error.message,
				statusCode.internalServerErrorCode
			);

		return bagUpdate;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Modifying Bag'
				: error,
			'Failed to modify bag resource',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function removeBagById
 * @description Deletes a specific bag resource from the database identified by its ID.
 * @param {string} bagId - The ID of the bag to be deleted.
 * @returns {Promise<Object>} An object containing the deleted bag details and metadata, or an error if the operation fails.
 */
export const removeBagById = async (bagId) => {
	try {
		const bagDelete = await prisma.bags.delete({
			where: { id: bagId },
			select: {
				id: true,
				name: true,
			},
		});

		if (!bagDelete)
			return new ErrorHandler(
				'bag not found',
				'Failed to find bag in the database',
				'prisma Error',
				statusCode.notFoundCode
			);

		if (bagDelete.error)
			return new ErrorHandler(
				'prisma',
				bagDelete.error,
				'Failed to delete bag in the database ' +
					bagDelete.error.message,
				statusCode.internalServerErrorCode
			);

		const totalCount = await prisma.bags.count();

		const meta = {
			totalCount: totalCount,
			totalDelete: bagDelete ? 1 : 0,
		};

		return { bagDelete: bagDelete, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Removing Bag'
				: error,
			'Failed to remove bag by id',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function removeAllBags
 * @description Deletes all bag resources from the database based on provided filtering criteria.
 * @param {Object} searchFilter - Filtering conditions for the deletion operation.
 * @returns {Promise<Object>} Metadata of the deletion operation, including the count of deleted bags, or an error if the operation fails.
 */
export const removeAllBags = async (searchFilter) => {
	try {
		const deleteCount = await prisma.bags.deleteMany({
			where: searchFilter,
		});

		if (deleteCount.error)
			return new ErrorHandler(
				'prisma',
				deleteCount.error,
				'Failed to delete all bags from the database',
				statusCode.internalServerErrorCode
			);

		const meta = {
			totalCount: deleteCount.count,
			totalDelete: deleteCount.count,
			searchFilter,
		};

		return { deleteCount: deleteCount, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Removing Bags By Filter'
				: error,
			'Failed to remove all bags'
		);
	}
};

//*======================================={Bags Private Route}==============================================

//*======================================={Suitcase Private Route}==============================================

/**
 * @function replaceSuitcaseResource
 * @description Replaces the details of a suitcase resource identified by its ID.
 * @param {string} suitcaseId - The ID of the suitcase to be replaced.
 * @param {Object} body - The new data for the suitcase, including name, type, brand, color, size, capacity, maxWeight, weight, material, features, and wheels.
 * @returns {Promise<Object>} The updated suitcase details, or an error if the operation fails.
 */
export const replaceSuitcaseResource = async (suitcaseId, body) => {
	try {
		const {
			name,
			type,
			brand,
			color,
			size,
			capacity,
			maxWeight,
			weight,
			material,
			features = [],
			wheels,
		} = body;

		const updatedSuitcase = await prisma.suitcases.update({
			where: { id: suitcaseId },
			data: {
				name: name,
				type: type,
				brand: brand,
				color: color,
				size: size,
				capacity: capacity,
				maxWeight: maxWeight,
				weight: weight,
				material: material,
				features: features,
				wheels: wheels,
			},
		});

		if (!updatedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error',
				statusCode.notFoundCode
			);

		if (updatedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				updatedSuitcase.error,
				'Failed to modify suitcase in the database ' +
					updatedSuitcase.error.message,
				statusCode.internalServerErrorCode
			);

		return updatedSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Replacing Suitcase'
				: error,
			'Failed to replace suitcase resource',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function modifySuitcaseResource
 * @description Modifies specific fields of a suitcase resource identified by its ID, with support for feature additions and removals.
 * @param {string} suitcaseId - The ID of the suitcase to be modified.
 * @param {Object} body - Partial fields to update, including name, type, brand, color, size, capacity, maxWeight, weight, material, features, removeFeatures, and wheels.
 * @returns {Promise<Object>} The modified suitcase details, or an error if the operation fails.
 */
export const modifySuitcaseResource = async (suitcaseId, body) => {
	try {
		const {
			name,
			type,
			brand,
			color,
			size,
			capacity,
			maxWeight,
			weight,
			material,
			features = [],
			removeFeatures = [],
			wheels,
		} = body;

		const suitcase = await prisma.suitcases.findUnique({
			where: { id: suitcaseId },
			select: {
				features: true,
			},
		});

		if (!suitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error',
				statusCode.notFoundCode
			);

		if (suitcase.error)
			return new ErrorHandler(
				'prisma',
				suitcase.error,
				'Failed to find suitcase in the database ' +
					suitcase.error.message,
				statusCode.internalServerErrorCode
			);

		// Normalize `removeFeatures` for case-insensitive matching
		let removeSet = [
			...new Set([...removeFeatures.map((f) => f.toUpperCase())]),
		];

		// Filter out features that need to be removed
		let newFeatures =
			suitcase.features?.filter(
				(f) => !removeSet.includes(f.toUpperCase())
			) || [];

		// Convert `features` to uppercase to match `suitcase.features`
		let updatedFeatures = [
			...new Set([
				...features.map((f) => f.toUpperCase()),
				...newFeatures,
			]),
		];

		const updatedSuitcase = await prisma.suitcases.update({
			where: { id: suitcaseId },
			data: {
				name: name || undefined,
				type: type || undefined,
				brand: brand || undefined,
				color: color || undefined,
				size: size || undefined,
				capacity: capacity || undefined,
				maxWeight: maxWeight || undefined,
				weight: weight || undefined,
				material: material || undefined,
				features:
					features.length || newFeatures.length
						? updatedFeatures
						: undefined,
				wheels: wheels || undefined,
			},
		});

		if (!updatedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error',
				statusCode.notFoundCode
			);

		if (updatedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				updatedSuitcase.error,
				'Failed to modify suitcase in the database ' +
					updatedSuitcase.error.message,
				statusCode.internalServerErrorCode
			);

		return updatedSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Modifying Suitcase'
				: error,
			'Failed to modify suitcase resource',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function removeSuitcaseById
 * @description Deletes a specific suitcase resource from the database identified by its ID.
 * @param {string} suitcaseId - The ID of the suitcase to be deleted.
 * @returns {Promise<Object>} An object containing the deleted suitcase details and metadata, or an error if the operation fails.
 */
export const removeSuitcaseById = async (suitcaseId) => {
	try {
		const deletedSuitcase = await prisma.suitcases.delete({
			where: { id: suitcaseId },
			select: {
				id: true,
				name: true,
			},
		});

		if (!deletedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error',
				statusCode.notFoundCode
			);

		if (deletedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcase.error,
				'Failed to remove suitcase from the database ' +
					deletedSuitcase.error.message,
				statusCode.internalServerErrorCode
			);

		const totalCount = await prisma.suitcases.count();

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedSuitcase ? 1 : 0,
		};

		return { deletedSuitcase: deletedSuitcase, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Removing Suitcase'
				: error,
			'Failed to remove suitcase by id',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function removeAllSuitcases
 * @description Deletes all suitcase resources from the database based on provided filtering criteria.
 * @param {Object} searchFilter - Filtering conditions for the deletion operation.
 * @returns {Promise<Object>} Metadata of the deletion operation, including the count of deleted suitcases, or an error if the operation fails.
 */
export const removeAllSuitcases = async (searchFilter) => {
	try {
		const deleteCount = await prisma.suitcases.deleteMany({
			where: searchFilter,
		});

		if (deleteCount.error)
			return new ErrorHandler(
				'prisma',
				deleteCount.error,
				'Failed to remove all suitcases from the database ' +
					deleteCount.error.message,
				statusCode.internalServerErrorCode
			);

		const totalCount = await prisma.suitcases.count();

		const meta = {
			totalCount: totalCount,
			totalDelete: deleteCount.count,
			searchFilter,
		};

		return { deleteCount: deleteCount, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Removing Suitcases By Filter'
				: error,
			'Failed to remove all suitcases',
			statusCode.internalServerErrorCode
		);
	}
};

//*======================================={Suitcase Private Route}==============================================

//*======================================={Items Private Route}==============================================

/**
 * @function replaceItemResource
 * @description Replaces the details of an item resource identified by its ID.
 * @param {string} itemId - The ID of the item to be replaced.
 * @param {Object} body - The new data for the item, including name, category, weight, volume, color, isFragile, and quantity.
 * @returns {Promise<Object>} The updated item details, or an error if the operation fails.
 */
export const replaceItemResource = async (itemId, body) => {
	try {
		const { name, category, weight, volume, color, isFragile, quantity } =
			body;

		const itemUpdate = await prisma.items.update({
			where: { id: itemId },
			data: {
				name: name,
				category: category,
				weight: weight,
				volume: volume,
				color: color,
				isFragile: isFragile,
				quantity: quantity,
			},
		});

		if (!itemUpdate)
			return new ErrorHandler(
				'item',
				'Item not found',
				'Item not found in the database',
				statusCode.notFoundCode
			);

		if (itemUpdate.error)
			return new ErrorHandler(
				'prisma',
				'Failed to update item in the database ' + itemUpdate.error,
				'Failed to update item in the database ' +
					itemUpdate.error.message,
				statusCode.internalServerErrorCode
			);

		return itemUpdate;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Replacing Item'
				: error,
			error.message || 'Failed to replace item resource',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function modifyItemResource
 * @description Modifies specific fields of an item resource identified by its ID.
 * @param {string} itemId - The ID of the item to be modified.
 * @param {Object} body - Partial fields to update, including name, category, weight, volume, color, isFragile, and quantity.
 * @returns {Promise<Object>} The modified item details, or an error if the operation fails.
 */
export const modifyItemResource = async (itemId, body) => {
	try {
		const { name, category, weight, volume, color, isFragile, quantity } =
			body;

		const itemUpdate = await prisma.items.update({
			where: { id: itemId },
			data: {
				name: name || undefined,
				category: category || undefined,
				quantity: quantity || undefined,
				isFragile: isFragile || undefined,
				color: color || undefined,
				weight: weight || undefined,
				volume: volume || undefined,
			},
		});

		if (!itemUpdate)
			return new ErrorHandler(
				'item',
				'Item not found',
				'Item not found in the database',
				statusCode.notFoundCode
			);

		if (itemUpdate.error)
			return new ErrorHandler(
				'prisma',
				'Failed to update item in the database ' + itemUpdate.error,
				'Failed to update item in the database ' +
					itemUpdate.error.message,
				statusCode.internalServerErrorCode
			);

		return itemUpdate;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Modifying Item'
				: error,
			error.message || 'Failed to modify item resource',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function removeItemById
 * @description Deletes a specific item resource from the database identified by its ID.
 * @param {string} itemId - The ID of the item to be deleted.
 * @returns {Promise<Object>} An object containing the deleted item details and metadata, or an error if the operation fails.
 */
export const removeItemById = async (itemId) => {
	try {
		const deletedItem = await prisma.items.delete({
			where: { id: itemId },
			select: {
				id: true,
				name: true,
			},
		});

		if (!deletedItem)
			return new ErrorHandler(
				'item',
				'Item not found',
				'Item not found in the database',
				statusCode.notFoundCode
			);

		if (deletedItem.error)
			return new ErrorHandler(
				'prisma',
				'Failed to delete item from the database ' + deletedItem.error,
				'Failed to delete item from the database ' +
					deletedItem.error.message,
				statusCode.internalServerErrorCode
			);

		const totalCount = await prisma.items.count();

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedItem ? 1 : 0,
		};

		return { deletedItem: deletedItem, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Removing Item'
				: error,
			'Failed to remove item by id',
			statusCode.internalServerErrorCode
		);
	}
};

/**
 * @function removeAllItems
 * @description Deletes all item resources from the database based on provided filtering criteria.
 * @param {Object} searchFilter - Filtering conditions for the deletion operation.
 * @returns {Promise<Object>} Metadata of the deletion operation, including the count of deleted items, or an error if the operation fails.
 */
export const removeAllItems = async (searchFilter) => {
	try {
		const deleteCount = await prisma.items.deleteMany({
			where: searchFilter,
		});

		if (deleteCount.error)
			return new ErrorHandler(
				'prisma',
				'Failed to delete all items ' + deleteCount.error,
				'Failed to delete all items ' + deleteCount.error.message,
				statusCode.internalServerErrorCode
			);

		const totalCount = await prisma.items.count();

		const meta = {
			totalCount: totalCount,
			totalDelete: deleteCount.count,
			searchFilter,
		};

		return { deleteCount: deleteCount, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			Object.keys(error).length === 0
				? 'Error Occur while Removing Items By Filter'
				: error,
			'Failed to remove all items',
			statusCode.internalServerErrorCode
		);
	}
};

//*======================================={Items Private Route}==============================================
