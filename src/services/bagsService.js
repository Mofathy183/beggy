import { ErrorHandler } from '../utils/error.js';
import { BagsModel } from '../../prisma/prisma.js';

export const findAllBagsByQuery = async (searchFilter, pagination, orderBy) => {
	try {
		const { page, limit, offset } = pagination;

		const bags = await BagsModel.findMany({
			where: { OR: searchFilter },
			select: {
				id: true,
				name: true,
				type: true,
				color: true,
				size: true,
				capacity: true,
				maxWeight: true,
				weight: true,
				material: true,
				feeatures: true,
				userId: true,
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						displayName: true,
						age: true,
					},
				},
				items: {
					select: {
						id: true,
						name: true,
						category: true,
						quantity: true,
						weight: true,
						volume: true,
						color: true,
						isFragile: true,
					},
				},
				skip: offset,
				take: limit,
				orderBy: orderBy,
			},
		});

		if (!bags)
			return new ErrorHandler(
				'bags not found',
				'Failed to find bags in the database',
				'prisma Error'
			);

		if (bags.error)
			return new ErrorHandler(
				'prisma',
				bags.error,
				'Failed to find bags in the database'
			);

		const meta = {
			totalCount: bags.length,
			page: page,
			limit: limit,
			offset: offset,
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
		const bag = await BagsModel.findUnique({
			where: { id: bagId },
			omit: {
				items: true,
				user: true,
				userId: true,
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
				'Failed to find bag in the database'
			);

		return bag;
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to get bag by id');
	}
};

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
			feeatures,
		} = body;

		const bagUpdate = await BagsModel.update({
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
				feeatures: feeatures,
			},
			omit: {
				user: true,
				items: true,
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
				'Failed to update bag in the database'
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
			feeatures,
		} = body;

		const bagUpdate = await BagsModel.update({
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
				feeatures: feeatures || undefined,
			},
			omit: {
				user: true,
				items: true,
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
				'Failed to update bag in the database'
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
		const bagDelete = await BagsModel.delete({
			where: { id: bagId },
			omit: {
				user: true,
				items: true,
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
				'Failed to delete bag in the database'
			);

		return bagDelete;
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to remove bag by id');
	}
};

export const removeAllBags = async () => {
	try {
		const deleteCount = await BagsModel.deleteMany({ where: {} });

		if (!deleteCount || deleteCount.count === 0)
			return new ErrorHandler(
				'Bags not deleted',
				'Delete null zero',
				'No bags to delete'
			);

		if (deleteCount.error)
			return new ErrorHandler(
				'prisma',
				deleteCount.error,
				'Failed to delete all bags from the database'
			);

		return deleteCount;
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to remove all bags');
	}
};

export const findBagsUserHas = async (
	userId,
	searchFilter,
	pagination,
	orderBy
) => {
	try {
		const { page, limit, offset } = pagination;

		const userBags = await BagsModel.findMany({
			where: { userId: userId, OR: searchFilter },
			select: {
				id: true,
				name: true,
				type: true,
				color: true,
				size: true,
				capacity: true,
				maxWeight: true,
				weight: true,
				material: true,
				feeatures: true,
				userId: true,
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						displayName: true,
						age: true,
					},
				},
				items: {
					select: {
						id: true,
						name: true,
						category: true,
						quantity: true,
						weight: true,
						volume: true,
						color: true,
						isFragile: true,
					},
				},
			},
			skip: offset,
			take: limit,
			orderBy: orderBy,
		});

		if (!userBags)
			return new ErrorHandler(
				'bags not found',
				'Failed to find bags in the database',
				'prisma Error'
			);

		if (userBags.error)
			return new ErrorHandler(
				'prisma',
				userBags.error,
				'Failed to find bags in the database'
			);

		const meta = {
			totalCount: userBags.length,
			page: page,
			limit: limit,
			offset: offset,
			searchFilter: searchFilter,
			orderBy: orderBy,
		};

		return { userBags, meta };
	} catch (error) {
		new ErrorHandler('catch', error, 'Failed to get bags user has');
	}
};

export const findBagUserHasById = async (userId, bagId) => {
	try {
		const userBag = await BagsModel.findUnique({
			where: { userId: userId, id: bagId },
			select: {
				id: true,
				name: true,
				type: true,
				color: true,
				size: true,
				capacity: true,
				maxWeight: true,
				weight: true,
				material: true,
				feeatures: true,
				userId: true,
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						displayName: true,
						age: true,
					},
				},
				items: {
					select: {
						id: true,
						name: true,
						category: true,
						quantity: true,
						weight: true,
						volume: true,
						color: true,
						isFragile: true,
					},
				},
			},
		});

		if (!userBag)
			return new ErrorHandler(
				'bag not found',
				'Failed to find bag in the database',
				'prisma Error'
			);

		if (userBag.error)
			return new ErrorHandler(
				'prisma',
				userBag.error,
				'Failed to find bag in the database'
			);

		return userBag;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to get bag user has by id'
		);
	}
};

export const addBagToUser = async (userId, body) => {
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
			feeatures,
		} = body;

		const userBag = await BagsModel.create({
			data: {
				name: name,
				type: type,
				color: color,
				size: size,
				capacity: capacity,
				maxWeight: maxWeight,
				weight: weight,
				material: material,
				feeatures: feeatures,
				userId: userId,
			},
			select: {
				id: true,
				name: true,
				type: true,
				color: true,
				size: true,
				capacity: true,
				maxWeight: true,
				weight: true,
				material: true,
				feeatures: true,
				userId: true,
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						displayName: true,
						age: true,
					},
				},
				items: {
					select: {
						id: true,
						name: true,
						category: true,
						quantity: true,
						weight: true,
						volume: true,
						color: true,
						isFragile: true,
					},
				},
			},
		});

		if (!userBag)
			return new ErrorHandler(
				'bag not created',
				'Failed to create bag in the database',
				'prisma Error'
			);

		if (userBag.error)
			return new ErrorHandler(
				'prisma',
				userBag.error,
				'Failed to create bag in the database'
			);

		return userBag;
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to add bag to user');
	}
};

export const replaceBagUserHas = async (userId, bagId, body) => {
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
			feeatures,
		} = body;

		const updatedBag = await BagsModel.update({
			where: { userId: userId, id: bagId },
			data: {
				name: name,
				type: type,
				color: color,
				size: size,
				capacity: capacity,
				maxWeight: maxWeight,
				weight: weight,
				material: material,
				feeatures: feeatures,
			},
			select: {
				id: true,
				name: true,
				type: true,
				color: true,
				size: true,
				capacity: true,
				maxWeight: true,
				weight: true,
				material: true,
				feeatures: true,
				userId: true,
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						displayName: true,
						age: true,
					},
				},
				items: {
					select: {
						id: true,
						name: true,
						category: true,
						quantity: true,
						weight: true,
						volume: true,
						color: true,
						isFragile: true,
					},
				},
			},
		});

		if (!updatedBag)
			return new ErrorHandler(
				'bag not updated',
				'Failed to update bag in the database',
				'prisma Error'
			);

		if (updatedBag.error)
			return new ErrorHandler(
				'prisma',
				updatedBag.error,
				'Failed to update bag in the database'
			);

		return updatedBag;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to replace bag user has'
		);
	}
};

export const modifyBagUserHas = async (userId, bagId, body) => {
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
			feeatures,
		} = body;

		const updatedBag = await BagsModel.update({
			where: { userId: userId, id: bagId },
			data: {
				name: name || undefined,
				type: type || undefined,
				color: color || undefined,
				size: size || undefined,
				capacity: capacity || undefined,
				maxWeight: maxWeight || undefined,
				weight: weight || undefined,
				material: material || undefined,
				feeatures: feeatures || undefined,
			},
			select: {
				id: true,
				name: true,
				type: true,
				color: true,
				size: true,
				capacity: true,
				maxWeight: true,
				weight: true,
				material: true,
				feeatures: true,
				userId: true,
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						displayName: true,
						age: true,
					},
				},
				items: {
					select: {
						id: true,
						name: true,
						category: true,
						quantity: true,
						weight: true,
						volume: true,
						color: true,
						isFragile: true,
					},
				},
			},
		});

		if (!updatedBag)
			return new ErrorHandler(
				'bag not modified',
				'Failed to modify bag in the database',
				'prisma Error'
			);

		if (updatedBag.error)
			return new ErrorHandler(
				'prisma',
				updatedBag.error,
				'Failed to modify bag in the database'
			);

		return updatedBag;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to modify bag user has'
		);
	}
};

export const removeBagUserHasById = async (userId, bagId) => {
	try {
		const deletedBag = await BagsModel.delete({
			where: { userId: userId, id: bagId },
		});

		if (!deletedBag)
			return new ErrorHandler(
				'bag not deleted',
				'Failed to delete bag from the database',
				'prisma Error'
			);

		if (deletedBag.error)
			return new ErrorHandler(
				'prisma',
				deletedBag.error,
				'Failed to delete bag from the database'
			);

		return deletedBag;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove bag user has by id'
		);
	}
};

export const removeAllBagsUserHas = async (userId) => {
	try {
		const deletedBags = await BagsModel.deleteMany({
			where: { userId: userId },
		});

		if (!deletedBags || deletedBags.count === 0)
			return new ErrorHandler(
				'bags not deleted',
				'Failed to delete all bags from the database',
				'prisma Error'
			);

		if (deletedBags.error)
			return new ErrorHandler(
				'prisma',
				deletedBags.error,
				'Failed to delete all bags from the database'
			);

		return deletedBags;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all bags user has'
		);
	}
};
