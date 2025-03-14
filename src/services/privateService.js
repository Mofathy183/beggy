import { ErrorHandler } from '../utils/error.js';
import prisma from '../../prisma/prisma.js';

//*======================================={Bags Private Route}==============================================

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
				'prisma Error'
			);

		if (bagUpdate.error)
			return new ErrorHandler(
				'prisma',
				bagUpdate.error,
				'Failed to update bag in the database ' +
					bagUpdate.error.message
			);

		return bagUpdate;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to replace bag resource'
		);
	}
};

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
				'prisma Error'
			);

		if (bagUpdate.error)
			return new ErrorHandler(
				'prisma',
				bagUpdate.error,
				'Failed to update bag in the database ' +
					bagUpdate.error.message
			);

		return bagUpdate;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to modify bag resource'
		);
	}
};

export const removeBagById = async (bagId) => {
	try {
		const bagDelete = await prisma.bags.delete({
			where: { id: bagId },
			omit: {
				user: true,
				bagItems: true,
			},
		});

		if (!bagDelete)
			return new ErrorHandler(
				'bag not found',
				'Failed to find bag in the database',
				'prisma Error'
			);

		if (bagDelete.error)
			return new ErrorHandler(
				'prisma',
				bagDelete.error,
				'Failed to delete bag in the database ' +
					bagDelete.error.message
			);

		const totalCount = await prisma.bags.count();

		const meta = {
			totalCount: totalCount,
			totalDelete: bagDelete ? 1 : 0,
		};

		return { bagDelete: bagDelete, meta: meta };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to remove bag by id');
	}
};

export const removeAllBags = async (searchFilter) => {
	try {
		const deleteCount = await prisma.bags.deleteMany({ where: searchFilter });

		if (deleteCount.error)
			return new ErrorHandler(
				'prisma',
				deleteCount.error,
				'Failed to delete all bags from the database'
			);

		const meta = {
			totalCount: deleteCount.count,
			totalDelete: deleteCount.count,
            searchFilter,
		};

		return { deleteCount: deleteCount, meta: meta };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to remove all bags');
	}
};

//*======================================={Bags Private Route}==============================================



//*======================================={Suitcase Private Route}==============================================

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
				maxweight: maxweight,
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
				maxweight: maxweight || undefined,
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

export const removeAllSuitcases = async (searchFilter) => {
	try {
		const deleteCount = await prisma.suitcases.deleteMany({ where: searchFilter });

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
			totalDelete: deleteCount.count,
            searchFilter,
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


//*======================================={Suitcase Private Route}==============================================


//*======================================={Items Private Route}==============================================

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
			select: {
				id: true,
				name: true,
				category: true,
				quantity: true,
				weight: true,
				volume: true,
				color: true,
				isFragile: true,
				userId: true,
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						displayName: true,
						birth: true,
						age: true,
					},
				},
			},
		});

		if (!itemUpdate)
			return new ErrorHandler(
				'item',
				'Item not found',
				'Item not found in the database'
			);

		if (itemUpdate.error)
			return new ErrorHandler(
				'prisma',
				'Failed to update item in the database ' + itemUpdate.error,
				'Failed to update item in the database ' +
					itemUpdate.error.message
			);

		return itemUpdate;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			error.message || 'Failed to replace item resource'
		);
	}
};

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
			select: {
				id: true,
				name: true,
				category: true,
				quantity: true,
				weight: true,
				volume: true,
				color: true,
				isFragile: true,
				userId: true,
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						displayName: true,
						birth: true,
						age: true,
					},
				},
			},
		});

		if (!itemUpdate)
			return new ErrorHandler(
				'item',
				'Item not found',
				'Item not found in the database'
			);

		if (itemUpdate.error)
			return new ErrorHandler(
				'prisma',
				'Failed to update item in the database ' + itemUpdate.error,
				'Failed to update item in the database ' +
					itemUpdate.error.message
			);

		return itemUpdate;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			error.message || 'Failed to modify item resource'
		);
	}
};

export const removeItemById = async (itemId) => {
	try {
		const deletedItem = await prisma.items.delete({
			where: { id: itemId },
		});

		if (!deletedItem)
			return new ErrorHandler(
				'item',
				'Item not found',
				'Item not found in the database'
			);

		if (deletedItem.error)
			return new ErrorHandler(
				'prisma',
				'Failed to delete item from the database ' + deletedItem.error,
				'Failed to delete item from the database ' +
					deletedItem.error.message
			);

		const totalCount = await prisma.items.count();

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedItem ? 1 : 0,
		};

		return { deletedItem: deletedItem, meta: meta };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to remove item by id');
	}
};

export const removeAllItems = async (searchFilter) => {
	try {
		const deleteCount = await prisma.items.deleteMany({where: searchFilter });

		if (deleteCount.error)
			return new ErrorHandler(
				'prisma',
				'Failed to delete all items ' + deleteCount.error,
				'Failed to delete all items ' + deleteCount.error.message
			);

		const totalCount = await prisma.items.count();

		const meta = {
			totalCount: totalCount,
			totalDelete: deleteCount.count,
            searchFilter,
		};

		return { deleteCount: deleteCount, meta: meta };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to remove all items');
	}
};


//*======================================={Items Private Route}==============================================
