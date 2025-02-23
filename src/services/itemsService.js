import { ErrorHandler } from '../utils/error.js';
import { ItemsModel, UserModel } from '../../prisma/prisma.js';
export const addItemToUser = async (userId, body) => {
    try {
        const {
            name,
            category,
            quantity,
            weight,
            volume,
            color,
            isFragile,
        } = body;

        const user = await UserModel.findUnique({ where: { id: userId }, select: { role: true } });

        if (!user) return new ErrorHandler(
            'user',
            'User not found',
            'User not found in the database'
        );

        if (user.error) return new ErrorHandler(
            'prisma',
            user.error || 'Failed to find user in the database',
            'Failed to find user in the database'
        )


        const item = await ItemsModel.create({
            data: {
                name,
                category,
                quantity,
                weight,
                volume,
                color,
                isFragile,
                userId: userId
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
                    }
                },
            }
        })

        if (!item) return new ErrorHandler(
            "Item null",
            "Item not Created",
            "Item not created"
        );

        if (item.error) return new ErrorHandler(
            "prisma",
            item.error || "Failed to create item in the database",
            "Failed to create item in the database"
        );

        return { item: item, role: user.role };
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            'Failed to add item to user'
        );
    }
}

export const addItemsToUSer = async (userId, body) => {
    try {
        const items = body.map((item) => ({
            userId: userId,
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            weight: item.weight,
            volume: item.volume,
            color: item.color,
            isFragile: item.isFragile,
        }));

        const createdItems = await ItemsModel.createMany({
            data: items,
            returnDocuments: true,
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

        if (!createdItems || createdItems.length === 0) {
            return new ErrorHandler(
                'items',
                'No items Created',
                'No items Created in the database'
            );
        };
        
        const meta = { };

        meta.totalCounnt = await ItemsModel.count({ where: { userId: userId } });

        if (meta.totalCounnt.error) {
            return new ErrorHandler(
                'prisma',
                meta.totalCounnt.error || 'Failed to count items',
                'Failed to count items'
            )
        }


        return { createdItems: createdItems, meta: meta };
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            'Failed to add items to user'
        );
    }
}

export const findItemById = async (itemId) => {
    try {
        const item = await ItemsModel.findUnique({
            where: { id: itemId },
            include: {
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

        if (!item) return new ErrorHandler(
            'item',
            'Item not found',
            'Item not found in the database'
        );

        if (item.error) return new ErrorHandler(
            'prisma',
            item.error || 'Failed to find item in the database',
            'Failed to find item in the database'
        )

        return item;
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            'Failed to find item by id'
        );
    }
}

export const findItemsByQuery = async (pagination, query) => {
    try {
        const { page, limit, offset } = pagination;
        const { name, category, color, isFragile } = query;

        const items = await ItemsModel.findMany( {
            where: {
                OR: {
                    name: { contains: name },
                    category: { contains: category },
                    color: { contains: color },
                    isFragile: isFragile,
                }
            },
            take: limit,
            skip: offset,
        });

        if (items.error) return new ErrorHandler(
            'prisma',
            items.error || 'Failed to find items in the database',
            'Failed to find items in the database'
        );

        const totalCount = await ItemsModel.count({
            where: {
                OR: {
                    name: { contains: name },
                    category: { contains: category },
                    color: { contains: color },
                    isFragile: isFragile,
                }
            },
            take: limit,
            skip: offset,
        })

        const meta = {
            totalCount: totalCount,
            page: page,
            limit: limit,
            itemsSearch: {
                name: name,
                category: category,
                color: color,
                isFragile: isFragile,
            }
        }

        return { meta: meta, items: items };
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            'Failed to find items by query'
        );
    }
}

export const findAllItems = async (query) => {
    try {
        const { page, limit, offset } = query;

        const items = await ItemsModel.findMany({
            take: limit,
            skip: offset,
        });

        if (items.error) return new ErrorHandler(
            'prisma',
            items.error || 'Failed to find items in the database',
            'Failed to find items in the database'
        );

        const totalCount = await ItemsModel.count({ take: limit, skip: offset });

        if (totalCount.error) return new ErrorHandler(
            'prisma',
            totalCount.error || 'Failed to count items',
            'Failed to count items'
        )

        const meta = {
            totalCount: totalCount,
            page: page,
            limit: limit,
            offset: offset,
        }

        return { meta: meta, items: items };
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            'Failed to find all items'
        );
    }
}

export const findItemsUserHas = async (userId, pagination) => {
	try {
        const { page, limit, offset } = pagination;

		const userItems = await ItemsModel.findMany({
			where: { userId: userId },
			omit: {
				createdAt: true,
				updatedAt: true,
				bagId: true,
				suitcaseId: true,
			},
			include: {
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
					},
				},
			},
			take: limit,
			skip: offset,
		});

		if (userItems.error)
			return new ErrorHandler(
				'prisma',
				'User has no item' || userItems.error,
				'There is no item to that user' || userItems.error.message
			);

		const itemsCount = await ItemsModel.count({
			where: { userId: userId },
			take: limit,
			skip: offset,
		});

		if (itemsCount.error)
			return new ErrorHandler(
				'prisma',
				'User has no item' || itemsCount.error,
				'There is no item to that user' || itemsCount.error.message
			);

		const meta = {
			total: itemsCount,
			page: page,
			limit: limit,
		};

		return { userItems: userItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			error.message || 'Failed to get items user has'
		);
	}
};


export const findItemUserHas = async (userId, itemId) => {
    try {
        const item = await ItemsModel.findUnique({
            where: { id: itemId, userId: userId },
            include: {
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

        if (!item) return new ErrorHandler(
            'item',
            'Item not found',
            'Item not found in the database'
        );

        if (item.error) return new ErrorHandler(
            'prisma',
            item.error || 'Failed to find item in the database',
            'Failed to find item in the database'
        )

        return item;
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            'Failed to find item user has'
        );
    }
}


export const replaceItemResource = async (id, body) => {
    try {
        const { name, category, weight, volume, color, isFragile, quantity } = body;

        const itemUpdate = await ItemsModel.update({
            where: { id: id },
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
                    }
                },
            }
        });

        if (itemUpdate.error) return new ErrorHandler(
            'prisma',
            itemUpdate.error || 'Failed to update item in the database',
            'Failed to update item in the database'
        );

        return itemUpdate;
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            error.message || 'Failed to replace item resource'
        );
    }
}


export const modifyItemResource = async (id, body) => {
    try {
        const { name, category, weight, volume, color, isFragile, quantity } = body;

        const itemUpdate = await ItemsModel.update({
            where: { id: id },
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
                    }
                },
            }
        });

        if (itemUpdate.error) return new ErrorHandler(
            'prisma',
            itemUpdate.error || 'Failed to update item in the database',
            'Failed to update item in the database'
        );

        return itemUpdate;
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            error.message || 'Failed to modify item resource'
        );
    }
}


export const replaceItemUserHas = async (userId, itemId, body) => {
    try {
        const { name, category, weight, volume, color, isFragile, quantity } = body;

        const itemUpdate = await ItemsModel.update({
            where: { id: itemId, userId: userId },
            data: {
                name: name,
                category: category,
                quantity: quantity,
                isFragile: isFragile,
                color: color,
                weight: weight,
                volume: volume,
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
                    }
                },
            }
        });

        if (itemUpdate.error) return new ErrorHandler(
            'prisma',
            itemUpdate.error || 'Failed to update item in the database',
            'Failed to update item in the database'
        );

        return itemUpdate;
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            error.message || 'Failed to replace item user has'
        );
    }
};

export const modifyItemUserHas = async (userId, itemId, body) => {
    try {
        const { name, category, weight, volume, color, isFragile, quantity } = body;

        const itemUpdate = await ItemsModel.update({
            where: { id: itemId, userId: userId },
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
                    }
                },
            }
        });

        if (itemUpdate.error) return new ErrorHandler(
            'prisma',
            itemUpdate.error || 'Failed to update item in the database',
            'Failed to update item in the database'
        );

        return itemUpdate;
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            error.message || 'Failed to modify item user has'
        );
    }
}


export const removeAllItemsUserHas = async (userId) => {
    try {
        const items = await ItemsModel.deleteMany({where: { userId: userId }});

        if (items.error) return new ErrorHandler(
            'prisma',
            items.error || 'Failed to delete all items from the database',
            'Failed to delete all items from the database'
        )

        return items;
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            'Failed to remove all items user has'
        );
    }
}


export const removeItemUserHas = async (userId, itemId) => {
    try {
        const item = await ItemsModel.delete({ where: { id: itemId, userId: userId } });

        if (item.error) return new ErrorHandler(
            'prisma',
            item.error || 'Failed to delete item from the database',
            'Failed to delete item from the database'
        )

        return item;
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            'Failed to remove item user has'
        );
    }
}

export const removeItemById = async (itemId) => {
    try {
        const item = await ItemsModel.delete({ where: { id: itemId } });

        if (item.error) return new ErrorHandler(
            'prisma',
            item.error || 'Failed to delete item from the database',
            'Failed to delete item from the database'
        )

        return item;
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            'Failed to remove item by id'
        );
    }
}



export const removeAllItems = async () => {
    try {
        const deleteCount = await ItemsModel.delete({ where: {} });

        if (deleteCount.error) return new ErrorHandler(
            'prisma',
            deleteCount.error || 'Failed to delete all items',
            'Failed to delete all items'
        );

        return deleteCount
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            'Failed to remove all items'
        );
    }
}
















// const body = {
//     "name": "T-Shirt",
//     "category": "clothes",
//     "quantity": 10,
//     "weight": 2.5,
//     "volume": 0.01,
//     "color": "red",
//     "isFragile": false
// }

async function create() {
    try {
        const {item, role} = await addItemToUser("e36ffd33-03d0-46a5-a4df-2204cbdc6ae6", body);

        console.log(item, role);
    }
    catch (error) {
        console.error(error);
    }
}
