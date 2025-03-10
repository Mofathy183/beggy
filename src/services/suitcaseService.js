import prisma from '../../prisma/prisma.js';
import { ErrorHandler } from '../utils/error.js';

export const findAllSuitcasesByQuery = async (
	searchFilter,
	pagination,
	orderBy
) => {
	try {
		const { page, limit, offset } = pagination;

		const suitcases = await prisma.suitcases.findMany({
			where: { ...searchFilter },
			omit: {
				user: true,
				userId: true,
				suitcaseItems: true,
			},
			take: limit,
			skip: offset,
			orderBy: orderBy,
		});

		if (!suitcases)
			return new ErrorHandler(
				'suitcases not found',
				'Failed to find suitcases in the database',
				'prisma Error'
			);

		if (suitcases.error)
			return new ErrorHandler(
				'prisma',
				suitcases.error,
				'Failed to find suitcases in the database ' +
					suitcases.error.message
			);

		const meta = {
			totalCount: suitcases.length,
			page: page,
			limit: limit,
			offset: offset,
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

export const replaceSuitcaseResource = async (suitcaseId, body) => {
	try {
		const {
			name,
			type,
			brand,
			color,
			size,
			capacity,
			maxweight,
			weight,
			material,
			features,
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
				maxweight: maxweight,
				weight: weight,
				material: material,
				features: features,
				wheels: wheels,
			},
			omit: {
				user: true,
				userId: true,
				suitcaseItems: true,
			},
		});

		if (!updatedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (updatedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				updatedSuitcase.error,
				'Failed to modify suitcase in the database ' +
					updatedSuitcase.error.message
			);

		return updatedSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to replace suitcase resource'
		);
	}
};

export const modifySuitcaseResource = async (suitcaseId, body) => {
	try {
		const {
			name,
			type,
			brand,
			color,
			size,
			capacity,
			maxweight,
			weight,
			material,
			features,
			removeFeatures,
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
				'prisma Error'
			);

		if (suitcase.error)
			return new ErrorHandler(
				'prisma',
				suitcase.error,
				'Failed to find suitcase in the database ' +
					suitcase.error.message
			);

		// Normalize `removeFeatures` for case-insensitive matching
		let removeSet = [
			...new Set([...removeFeatures.map((f) => f.toUpperCase())]),
		];
		console.log('Removing features: ', removeSet);

		// Filter out features that need to be removed
		let newFeatures =
			suitcase.features?.filter(
				(f) => !removeSet.includes(f.toUpperCase())
			) || [];
		console.log('New features: ', newFeatures);

		// Convert `features` to uppercase to match `suitcase.features`
		let updatedFeatures = [
			...new Set([
				...features.map((f) => f.toUpperCase()),
				...newFeatures,
			]),
		];
		console.log('Updated features: ', updatedFeatures);

		const updatedSuitcase = await prisma.suitcases.update({
			where: { id: suitcaseId },
			data: {
				name: name || undefined,
				type: type || undefined,
				brand: brand || undefined,
				color: color || undefined,
				size: size || undefined,
				capacity: capacity || undefined,
				maxweight: maxweight || undefined,
				weight: weight || undefined,
				material: material || undefined,
				features:
					features.length || newFeatures.length
						? updatedFeatures
						: undefined,
				wheels: wheels || undefined,
			},
			omit: {
				user: true,
				userId: true,
				suitcaseItems: true,
			},
		});

		if (!updatedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (updatedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				updatedSuitcase.error,
				'Failed to modify suitcase in the database ' +
					updatedSuitcase.error.message
			);

		return updatedSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to modify suitcase resource'
		);
	}
};

export const removeSuitcaseById = async (suitcaseId) => {
	try {
		const deletedSuitcase = await prisma.suitcases.delete({
			where: { id: suitcaseId },
			omit: {
				user: true,
				userId: true,
				suitcaseItems: true,
			},
		});

		if (!deletedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (deletedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcase.error,
				'Failed to remove suitcase from the database ' +
					deletedSuitcase.error.message
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
			error,
			'Failed to remove suitcase by id'
		);
	}
};

export const removeAllSuitcases = async () => {
	try {
		const deleteCount = await prisma.suitcases.deleteMany();

		if (deleteCount.error)
			return new ErrorHandler(
				'prisma',
				deleteCount.error,
				'Failed to remove all suitcases from the database ' +
					deleteCount.error.message
			);

		const totalCount = await prisma.suitcases.count();

		const meta = {
			totalCount: totalCount,
			totalDelete: deleteCount ? deleteCount.count : 0,
		};

		return { deleteCount: deleteCount, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all suitcases'
		);
	}
};

//*===================================={suitcases Route For User}===================================

export const findSuitcasesUserHas = async (
	userId,
	searchFilter,
	pagination,
	orderBy
) => {
	try {
		const { page, limit, offset } = pagination;

		const suitcases = await prisma.suitcases.findMany({
			where: { ...searchFilter, userId: userId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
			take: limit,
			skip: offset,
			orderBy: orderBy,
		});

		if (!suitcases)
			return new ErrorHandler(
				'suitcases not found',
				'Failed to find suitcases in the database',
				'prisma Error'
			);

		if (suitcases.error)
			return new ErrorHandler(
				'prisma',
				suitcases.error,
				'Failed to find suitcases in the database ' +
					suitcases.error.message
			);

		const totalCount = await prisma.suitcases.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			page: page,
			limit: limit,
			offset: offset,
			searchFilter: searchFilter,
			orderBy: orderBy,
		};

		return { meta: meta, suitcases: suitcases };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to find suitcases user has'
		);
	}
};

export const findSuitcaseUserHasById = async (userId, suitcaseId) => {
	try {
		const suitcase = await prisma.suitcases.findUnique({
			where: { userId: userId, id: suitcaseId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
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
			'Failed to find suitcase user has by id'
		);
	}
};

export const addSuitcaseToUser = async (userId, body) => {
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
			features,
			wheels,
		} = body;

		const newSuitcase = await prisma.suitcases.create({
			data: {
				userId: userId,
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
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
		});

		if (!newSuitcase)
			return new ErrorHandler(
				'suitcase not created',
				'Failed to create suitcase in the database',
				'prisma Error'
			);

		if (newSuitcase.error)
			return new ErrorHandler(
				'prisma',
				newSuitcase.error,
				'Failed to create suitcase in the database ' +
					newSuitcase.error.message
			);

		const totalCount = await prisma.suitcases.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			totalCreate: newSuitcase ? 1 : 0,
		};

		return { newSuitcase: newSuitcase, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to add suitcase to user'
		);
	}
};

export const addItemToUserSuitcase = async (userId, suitcaseId, body) => {
	try {
		const { itemId } = body;

		const suitcase = await prisma.suitcases.findUnique({
			where: { userId: userId, id: suitcaseId },
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

		const userItem = await prisma.items.findUnique({
			where: { userId: userId, id: itemId },
		});

		if (!userItem)
			return new ErrorHandler(
				'item not found',
				'Failed to find item in the database',
				'prisma Error'
			);

		if (userItem.error)
			return new ErrorHandler(
				'prisma',
				userItem.error,
				'Failed to find item in the database ' + userItem.error.message
			);

		if (
			!(
				suitcase.capacity >=
				(userItem.volume * userItem.quantity) / 100
			) &&
			!(suitcase.weight >= (userItem.weight * userItem.quantity) / 100)
		)
			return new ErrorHandler(
				'suitcase capacity or weight exceeded',
				'The suitcase does not have enough capacity or weight to accommodate the item',
				'suitcase capacity or weight exceeded'
			);

		const suitcaseItem = await prisma.suitcaseItems.upsert({
			where: {
				suitcaseId_itemId: { suitcaseId, itemId },
			},
			update: {
				itemId: itemId,
			},
			create: {
				suitcaseId: suitcaseId,
				itemId: itemId,
			},
		});

		if (!suitcaseItem)
			return new ErrorHandler(
				'item not added in suitcase',
				'Failed to add item to the suitcase in the database',
				'prisma Error'
			);

		if (suitcaseItem.error)
			return new ErrorHandler(
				'prisma',
				suitcaseItem.error,
				'Failed to add item to the suitcase in the database ' +
					suitcaseItem.error.message
			);

		const userSuitcase = await prisma.suitcases.findUnique({
			where: { userId: userId, id: suitcaseId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
		});

		if (!userSuitcase)
			return new ErrorHandler(
				'suitcase is not full',
				'The suitcase has enough capacity and weight to accommodate the item',
				'suitcase is not full'
			);

		if (userSuitcase.error)
			return new ErrorHandler(
				'prisma',
				userSuitcase.error,
				'Failed to find suitcase in the database ' +
					userSuitcase.error.message
			);

		if (userSuitcase.isWeightExceeded || userSuitcase.isCapacityExceeded)
			return new ErrorHandler(
				'suitcase is exceeded capacity and weight',
				'Cannot add that item to suitcase ',
				'The suitcase will be exceeded capacity and weight if you add that item'
			);

		const totalCount = await prisma.suitcaseItems.count({
			where: {
				suitcaseId: suitcaseId,
			},
		});

		const meta = {
			totalCount: totalCount,
			totalAdd: suitcaseItem ? 1 : 0,
		};

		return { suitcaseItems: userSuitcase, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to add item to user bag'
		);
	}
};

export const addItemsToUserSuitcase = async (userId, suitcaseId, body) => {
	try {
		const suitcase = await prisma.suitcases.findUnique({
			where: { id: suitcaseId, userId: userId },
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

		const userItems = await prisma.items.findMany({
			where: { userId: userId },
		});

		if (!userItems)
			return new ErrorHandler(
				'items not found',
				'Failed to find items in the database',
				'prisma Error'
			);

		if (userItems.error)
			return new ErrorHandler(
				'prisma',
				userItems.error,
				'Failed to find items in the database ' +
					userItems.error.message
			);

		const userItemsIds = userItems.map((item, index) => {
			let itemId = body.itemsIds[index].itemId;
			let canFit =
				suitcase.capacity >= item.volume &&
				suitcase.weight >= item.weight;

			return canFit ? { itemId } : {};
		});

		if (userItemsIds.length === 0)
			return new ErrorHandler(
				'suitcase capacity or weight exceeded',
				'The suitcase does not have enough capacity or weight to accommodate all the items',
				'suitcase capacity or weight exceeded'
			);

		const suitcaseItems = await prisma.suitcaseItems.createMany({
			data: userItemsIds.map((item) => ({
				suitcaseId,
				itemId: item.itemId,
			})),
			skipDuplicates: true,
		});

		if (suitcaseItems.error)
			return new ErrorHandler(
				'prisma',
				suitcaseItems.error,
				'Failed to add items to the suitcase in the database ' +
					suitcaseItems.error.message
			);

		const isSuitcaseFull = await prisma.suitcases.findUnique({
			where: { id: suitcaseId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
		});

		if (
			isSuitcaseFull.isWeightExceeded ||
			isSuitcaseFull.isCapacityExceeded
		)
			return new ErrorHandler(
				'suitcase is exceeded capacity and weight',
				'Cannot add those items to suitcase ',
				'The suitcase will be exceeded capacity and weight if you add those items'
			);

		const totalCount = await prisma.suitcaseItems.count({
			where: {
				suitcaseId: suitcaseId,
			},
		});

		const meta = {
			totalCount: totalCount,
			totalAdd: suitcaseItems ? suitcaseItems.count : 0,
		};

		return { suitcaseItems: isSuitcaseFull, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to add items to user suitcase'
		);
	}
};

export const replaceSuitcaseUserHas = async (userId, suitcaseId, body) => {
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
			features,
			wheels,
		} = body;

		const updatedSuitcase = await prisma.suitcases.update({
			where: { userId: userId, id: suitcaseId },
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
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
		});

		if (!updatedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (updatedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				updatedSuitcase.error,
				'Failed to modify suitcase in the database ' +
					updatedSuitcase.error.message
			);

		return updatedSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to modify suitcase user has'
		);
	}
};

export const modifySuitcaseUserHas = async (userId, suitcaseId, body) => {
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
			features,
			removeFeatures,
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
				'prisma Error'
			);

		if (suitcase.error)
			return new ErrorHandler(
				'prisma',
				suitcase.error,
				'Failed to find suitcase in the database ' +
					suitcase.error.message
			);

		// Normalize `removeFeatures` for case-insensitive matching
		let removeSet = [
			...new Set([...removeFeatures.map((f) => f.toUpperCase())]),
		];
		console.log('Removing features: ', removeSet);

		// Filter out features that need to be removed
		let newFeatures =
			suitcase.features?.filter(
				(f) => !removeSet.includes(f.toUpperCase())
			) || [];
		console.log('New features: ', newFeatures);

		// Convert `features` to uppercase to match `suitcase.features`
		let updatedFeatures = [
			...new Set([
				...features.map((f) => f.toUpperCase()),
				...newFeatures,
			]),
		];
		console.log('Updated features: ', updatedFeatures);

		const updatedSuitcase = await prisma.suitcases.update({
			where: { userId: userId, id: suitcaseId },
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
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
		});

		if (!updatedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (updatedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				updatedSuitcase.error,
				'Failed to find suitcase in the database ' +
					updatedSuitcase.error.message
			);

		return updatedSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to modify suitcase user has'
		);
	}
};

export const removeSuitcaseUserHasById = async (userId, suitcaseId) => {
	try {
		const deletedSuitcase = await prisma.suitcases.delete({
			where: { userId: userId, id: suitcaseId },
		});

		if (!deletedSuitcase)
			return new ErrorHandler(
				'suitcase not found',
				'Failed to find suitcase in the database',
				'prisma Error'
			);

		if (deletedSuitcase.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcase.error,
				'Failed to delete suitcase in the database ' +
					deletedSuitcase.error.message
			);

		const totalCount = await prisma.suitcases.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedSuitcase ? 1 : 0,
		};

		return { deletedSuitcase: deletedSuitcase, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove suitcase user has by id'
		);
	}
};

export const removeItemFromUserSuitcase = async (userId, suitcaseId, body) => {
	try {
		const { itemId } = body;

		const deletedSuitcaseItem = await prisma.suitcaseItems.delete({
			where: { suitcaseId_itemId: { suitcaseId, itemId } },
		});

		if (!deletedSuitcaseItem)
			return new ErrorHandler(
				'suitcase item not deleted',
				'Failed to delete item from the database',
				'prisma Error'
			);

		if (deletedSuitcaseItem.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcaseItem.error,
				'Failed to delete item from the database ' +
					deletedSuitcaseItem.error.message
			);

		const suitcaseItems = await prisma.suitcases.findUnique({
			where: { id: suitcaseId, userId: userId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
		});

		const totalCount = await prisma.suitcaseItems.count({
			where: { suitcaseId: suitcaseId },
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedSuitcaseItem ? 1 : 0,
		};

		return { suitcaseItems: suitcaseItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'Catch',
			error,
			'Failed to remove item from user suitcase'
		);
	}
};

export const removeItemsFromUserSuitcase = async (userId, suitcaseId, body) => {
	try {
		const { itemsIds } = body;

		const deletedSuitcaseItems = await prisma.suitcaseItems.deleteMany({
			where: {
				suitcaseId: suitcaseId,
				itemId: { in: itemsIds },
			},
		});

		if (deletedSuitcaseItems.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcaseItems.error,
				'Failed to delete items from the database ' +
					deletedSuitcaseItems.error.message
			);

		const suitcaseItems = await prisma.suitcases.findUnique({
			where: { id: suitcaseId, userId: userId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
		});

		const totalCount = await prisma.suitcaseItems.count({
			where: {
				suitcaseId: suitcaseId,
			},
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedSuitcaseItems.count,
		};

		return { suitcaseItems: suitcaseItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove items from user suitcase'
		);
	}
};

export const removeAllItemsFromUserSuitcase = async (
	userId,
	suitcaseId,
	searchFilter
) => {
	try {
		const deletedSuitcaseItems = await prisma.suitcaseItems.deleteMany({
			where: {
				item: searchFilter,
				suitcaseId: suitcaseId,
			},
		});

		if (deletedSuitcaseItems.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcaseItems.error,
				'Failed to delete all items from the database ' +
					deletedSuitcaseItems.error.message
			);

		const suitcaseItems = await prisma.suitcases.findUnique({
			where: { id: suitcaseId, userId: userId },
			include: {
				suitcaseItems: {
					select: {
						item: true,
					},
				},
			},
		});

		const totalCount = await prisma.suitcaseItems.count({
			where: {
				suitcaseId: suitcaseId,
			},
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedSuitcaseItems.count,
		};

		return { suitcaseItems: suitcaseItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all items from user suitcase'
		);
	}
};

export const removeAllSuitcasesUserHas = async (userId, searchFilter) => {
	try {
		const deletedSuitcases = await prisma.suitcases.deleteMany({
			where: { ...searchFilter, userId: userId },
		});

		if (deletedSuitcases.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcases.error,
				'Failed to delete suitcases in the database ' +
					deletedSuitcases.error.description
			);

		const totalCount = await prisma.suitcases.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedSuitcases.count,
		};

		return { deletedSuitcases: deletedSuitcases, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all suitcases user has'
		);
	}
};
