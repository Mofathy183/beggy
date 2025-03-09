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
			where: { OR: searchFilter },
			omit: {
				user: true,
				userId: true,
				items: true,
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
				'Failed to find suitcases in the database'
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
				items: true,
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
				'Failed to find suitcase in the database'
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
			maxWidth,
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
				maxWidth: maxWidth,
				weight: weight,
				material: material,
				features: features,
				wheels: wheels,
			},
			omit: {
				user: true,
				userId: true,
				items: true,
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
				'Failed to modify suitcase in the database'
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
			maxWidth,
			weight,
			material,
			features,
			wheels,
		} = body;

		const updatedSuitcase = await prisma.suitcases.update({
			where: { id: suitcaseId },
			data: {
				name: name || undefined,
				type: type || undefined,
				brand: brand || undefined,
				color: color || undefined,
				size: size || undefined,
				capacity: capacity || undefined,
				maxWidth: maxWidth || undefined,
				weight: weight || undefined,
				material: material || undefined,
				features: features || undefined,
				wheels: wheels || undefined,
			},
			select: {
				id: true,
				name: true,
				type: true,
				brand: true,
				color: true,
				size: true,
				capacity: true,
				maxWidth: true,
				weight: true,
				material: true,
				features: true,
				wheels: true,
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
				'Failed to modify suitcase in the database'
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
				items: true,
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
				'Failed to remove suitcase from the database'
			);

		return deletedSuitcase;
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
		const deleteCount = await prisma.suitcases.delete({ where: {} });

		if (!deleteCount || deleteCount.count === 0)
			return new ErrorHandler(
				'Suitcases not deleted',
				'Failed to delete all suitcases in the database',
				'prisma Error'
			);

		return deleteCount;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all suitcases'
		);
	}
};

export const findSuitcasesUserHas = async (
	userId,
	searchFilter,
	pagination,
	orderBy
) => {
	try {
		const { page, limit, offset } = pagination;

		const suitcases = await prisma.suitcases.findMany({
			where: { userId: userId, OR: searchFilter },
			select: {
				id: true,
				name: true,
				type: true,
				brand: true,
				color: true,
				size: true,
				capacity: true,
				maxWidth: true,
				weight: true,
				material: true,
				features: true,
				wheels: true,
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
				'Failed to find suitcases in the database'
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
			select: {
				id: true,
				name: true,
				type: true,
				brand: true,
				color: true,
				size: true,
				capacity: true,
				maxWidth: true,
				weight: true,
				material: true,
				features: true,
				wheels: true,
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
				'Failed to find suitcase in the database'
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
			maxWidth,
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
				maxWidth: maxWidth,
				weight: weight,
				material: material,
				features: features,
				wheels: wheels,
			},
			select: {
				id: true,
				name: true,
				type: true,
				brand: true,
				color: true,
				size: true,
				capacity: true,
				maxWidth: true,
				weight: true,
				material: true,
				features: true,
				wheels: true,
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
				'Failed to create suitcase in the database'
			);

		return newSuitcase;
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

        const userSuitcase = await prisma.suitcases.findUnique({
            where: { userId: userId, id: suitcaseId },
        })

        if (!userSuitcase) return new ErrorHandler(
            'user suitcase not found',
            'Failed to find user suitcase in the database',
            'prisma Error',
        )

        if (userSuitcase.error) return new ErrorHandler(
            'prisma',
            userSuitcase.error,
            'Failed to find user suitcase in the database',
        )

        const userItem = await prisma.items.findUnique({
            where: { userId: userId, id: itemId },
        })

        if (!userItem) return new ErrorHandler(
            'user item not found',
            'Failed to find user item in the database',
            'prisma Error',
        )

        if (userItem.error) return new ErrorHandler(
            'prisma',
            userItem.error,
            'Failed to find user item in the database',
        )

        if (
            (userSuitcase.capacity >= userItem.volume) && (userSuitcase.weight >= userItem.weight)
        )return new ErrorHandler(
            'item exceeds suitcase capacity or weight',
            'Failed to add item to suitcase due to capacity or weight constraints',
            'if you add this item to your suitcase will be exsceeded capacity and weight constraints',
        );

        const updatedSuitcase = await prisma.suitcaseItems.create({
            data: {
                suitcase: { connect: { id: suitcaseId } },
                items: { connect: { id: itemId } },
            },
            include: {
                suitcase: true,
                item: true,
            },
        })

        if (!updatedSuitcase) return new ErrorHandler(
            'item not added',
            'Failed to add item to suitcase in the database',
            'prisma Error',
        )

        if (updatedSuitcase.error) return new ErrorHandler(
            'prisma',
            updatedSuitcase.error,
            'Failed to add item to suitcase in the database',
        )

        return updatedSuitcase;
    }

    catch (error) {
        return new ErrorHandler(
            'item not added',
            error,
            'Failed to add item to suitcase in the database',
        );
    }
}

export const addItemsToUserSuitcase = async (userId, suitcaseId, body) => {
    try {
        const userSuitcase = await prisma.suitcases.findUnique({
            where: { userId: userId, id: suitcaseId },
        });

        if (!userSuitcase) return new ErrorHandler(
            'suitcase not found', 
            'Failed to find suitcase in the database', 
            'prisma Error'
        );

        if (userSuitcase.error) return new ErrorHandler(
            'prisma', 
            userSuitcase.error, 
            'Failed to find suitcase in the database'
        );

        const userItems = await prisma.items.findMany({
            where: { userId: userId },
        });

        const userItemsIds = userItems.filter((id, index) => {
            let itemId = body.itemsIds[index].itemId;

            return itemId && userSuitcase.capacity >= userItems[index].volume && userSuitcase.weight >= userItems[index].weight;
        });

        if (userItemsIds.length === 0) return new ErrorHandler(
            'suitcase capacity or weight exceeded', 
            'The suitcase does not have enough capacity or weight to accommodate all the items', 
            'suitcase capacity or weight exceeded'
        );

        const updatedsuitcaseItems = await prisma.suitcases.create({
            data: {
                suitcase: { connect: { id: suitcaseId } },
                items: { connectMany: userItemsIds.map(item => ({ id: item })) },
            },
            include: {
                suitcase: true,
                item: true,
            },
        });

        if (!updatedsuitcaseItems) return new ErrorHandler(
            'items not added', 
            'Failed to add items to the suitcase in the database', 
            'prisma Error'
        );

        if (updatedsuitcaseItems.error) return new ErrorHandler(
            'prisma', 
            updatedsuitcaseItems.error, 
            'Failed to add items to the suitcase in the database'
        );

        const issuitcaseFull = await prisma.suitcases.findUnique({
            where: { userId: userId, id: suitcaseId },
            select: {
                capacity: true,
                maxWeight: true,
                weight: true,
                suitcaseItems: true,
                isWeightExceeded: true,
                isCapacityExceeded: true
            },
        })

        if (!issuitcaseFull.isWeightExceeded &&!issuitcaseFull.isCapacityExceeded) return new ErrorHandler(
            'suitcase is exceeded capacity and weight', 
            'Cannot add those items to suitcase ', 
            'The suitcase will be exceeded capacity and weight if you add those items'
        );

        return updatedsuitcaseItems;
    }

    catch (error) {
        return new ErrorHandler(
            'items not added',
            error,
            'Failed to add items to suitcase in the database',
        );
    }
}

export const replaceSuitcaseUserHas = async (userId, suitcaseId, body) => {
	try {
		const {
			name,
			type,
			brand,
			color,
			size,
			capacity,
			maxWidth,
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
				maxWidth: maxWidth,
				weight: weight,
				material: material,
				features: features,
				wheels: wheels,
			},
			select: {
				id: true,
				name: true,
				type: true,
				brand: true,
				color: true,
				size: true,
				capacity: true,
				maxWidth: true,
				weight: true,
				material: true,
				features: true,
				wheels: true,
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
				'Failed to modify suitcase in the database'
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
			maxWidth,
			weight,
			material,
			features,
			wheels,
		} = body;

		const updatedSuitcase = await prisma.suitcases.update({
			where: { userId: userId, id: suitcaseId },
			data: {
				name: name || undefined,
				type: type || undefined,
				brand: brand || undefined,
				color: color || undefined,
				size: size || undefined,
				capacity: capacity || undefined,
				maxWidth: maxWidth || undefined,
				weight: weight || undefined,
				material: material || undefined,
				features: features || undefined,
				wheels: wheels || undefined,
			},
			select: {
				id: true,
				name: true,
				type: true,
				brand: true,
				color: true,
				size: true,
				capacity: true,
				maxWidth: true,
				weight: true,
				material: true,
				features: true,
				wheels: true,
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
				'Failed to find suitcase in the database'
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
				'Failed to delete suitcase in the database'
			);

		return deletedSuitcase;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove suitcase user has by id'
		);
	}
};

export const removeAllSuitcasesUserHas = async (userId) => {
	try {
		const deletedSuitcases = await prisma.suitcases.deleteMany({
			where: { userId: userId },
		});

		if (!deletedSuitcases || deletedSuitcases.count === 0)
			return new ErrorHandler(
				'suitcases not found',
				'Failed to find suitcases in the database',
				'prisma Error'
			);

		if (deletedSuitcases.error)
			return new ErrorHandler(
				'prisma',
				deletedSuitcases.error,
				'Failed to delete suitcases in the database'
			);

		return deletedSuitcases;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all suitcases user has'
		);
	}
};
