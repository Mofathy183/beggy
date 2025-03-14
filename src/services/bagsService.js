import { ErrorHandler } from '../utils/error.js';
import prisma from '../../prisma/prisma.js';


export const findBagsUserHas = async (
	userId,
	searchFilter,
	pagination,
	orderBy
) => {
	try {
		const { page, limit, offset } = pagination;

		const userBags = await prisma.bags.findMany({
			where: { userId: userId, ...searchFilter },
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
				features: true,
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
				bagItems: true,
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
				'Failed to find bags in the database ' + userBags.error.message
			);

		const totalCount = await prisma.bags.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			totalFind: userBags.length,
			page: page,
			limit: limit,
			offset: offset,
			searchFilter: searchFilter,
			orderBy: orderBy,
		};

		return { userBags: userBags, meta: meta };
	} catch (error) {
		new ErrorHandler('catch', error, 'Failed to get bags user has');
	}
};

export const findBagUserHasById = async (userId, bagId) => {
	try {
		const userBag = await prisma.bags.findUnique({
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
				features: true,
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
				bagItems: true,
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

		const totalCount = await prisma.bags.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			totalFind: userBag ? 1 : 0,
		};

		return { userBag: userBag, meta: meta };
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
			features,
		} = body;

		const newBag = await prisma.bags.create({
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
				features: true,
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
				bagItems: true,
			},
		});

		if (!newBag)
			return new ErrorHandler(
				'bag not created',
				'Failed to create bag in the database',
				'prisma Error'
			);

		if (newBag.error)
			return new ErrorHandler(
				'prisma',
				newBag.error,
				'Failed to create bag in the database ' + newBag.error.message
			);

		const totalCount = await prisma.bags.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			totalCreate: newBag ? 1 : 0,
		};

		return { meta: meta, newBag: newBag };
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
			features,
		} = body;

		const updatedBag = await prisma.bags.update({
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
				features: features,
			},
			include: {
				bagItems: {
					select: {
						item: true,
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
				'Failed to update bag in the database ' +
					updatedBag.error.message
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
			features,
			removeFeatures,
		} = body;

		const bag = await prisma.bags.findUnique({
			where: { id: bagId, userId: userId },
			select: {
				userId: true,
				features: true,
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

		// Normalize `removeFeatures` for case-insensitive matching
		let removeSet = [
			...new Set([...removeFeatures.map((f) => f.toUpperCase())]),
		];
		console.log('Removing features: ', removeSet);

		// Filter out features that need to be removed
		let newFeatures =
			bag.features?.filter((f) => !removeSet.includes(f.toUpperCase())) ||
			[];
		console.log('New features: ', newFeatures);

		// Convert `features` to uppercase to match `bag.features`
		let updatedFeatures = [
			...new Set([
				...features.map((f) => f.toUpperCase()),
				...newFeatures,
			]),
		];
		console.log('Updated features: ', updatedFeatures);

		const updatedBag = await prisma.bags.update({
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
				features:
					features.length || newFeatures.length
						? updatedFeatures
						: undefined,
			},
			include: {
				bagItems: {
					select: {
						item: true,
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
				'Failed to modify bag in the database ' +
					updatedBag.error.message
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
		const deletedBag = await prisma.bags.delete({
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
				'Failed to delete bag from the database ' +
					deletedBag.error.message
			);

		const totalCount = await prisma.bags.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedBag ? 1 : 0,
		};

		return { deletedBag: deletedBag, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove bag user has by id'
		);
	}
};

export const removeAllBagsUserHas = async (userId, searchFilter) => {
	try {
		const deletedBags = await prisma.bags.deleteMany({
			where: {
				...searchFilter,
				userId: userId,
			},
		});

		if (deletedBags.error)
			return new ErrorHandler(
				'prisma',
				deletedBags.error,
				'Failed to delete all bags from the database ' +
					deletedBags.error.message
			);

		const totalCount = await prisma.bags.count({
			where: { userId: userId },
		});

		const meta = {
			totalCount: totalCount,
			totalDelete: deletedBags.count,
		};

		return { deletedBags: deletedBags, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all bags user has'
		);
	}
};
