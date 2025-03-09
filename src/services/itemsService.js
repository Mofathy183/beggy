import { ErrorHandler } from '../utils/error.js';
import prisma from '../../prisma/prisma.js';

export const findAllItems = async (query) => {
	try {
		const { page, limit, offset } = query;

		const items = await prisma.items.findMany({
			take: limit,
			skip: offset,
		});

		if (items.error)
			return new ErrorHandler(
				'prisma',
				items.error || 'Failed to find items in the database',
				'Failed to find items in the database'
			);

		const totalCount = await prisma.items.count();

		if (totalCount.error)
			return new ErrorHandler(
				'prisma',
				totalCount.error || 'Failed to count items',
				'Failed to count items'
			);

		const meta = {
			totalCount: totalCount,
            totalFind: items.length,
			page: page,
			limit: limit,
			offset: offset,
		};

		return { meta: meta, items: items };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to find all items');
	}
};

export const findItemById = async (itemId) => {
	try {
		const item = await prisma.items.findUnique({
			where: { id: itemId },
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

		if (!item)
			return new ErrorHandler(
				'item',
				'Item not found',
				'Item not found in the database'
			);

		if (item.error)
			return new ErrorHandler(
				'prisma',
				'Failed to find item in the database '+ item.error,
				'Failed to find item in the database '+ item.error.message
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
			where: {
				...searchFilter,
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
            totalSearch: items.length,
			page: page,
			limit: limit,
			searchFilter,
			orderBy,
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

        if (!itemUpdate) return new ErrorHandler(
            'item',
            'Item not found',
            'Item not found in the database'
        )

		if (itemUpdate.error)
			return new ErrorHandler(
				'prisma',
				'Failed to update item in the database '+itemUpdate.error ,
				'Failed to update item in the database '+itemUpdate.error.message
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

        if (!itemUpdate) return new ErrorHandler(
            'item',
            'Item not found',
            'Item not found in the database'
        )

		if (itemUpdate.error)
			return new ErrorHandler(
				'prisma',
				'Failed to update item in the database '+ itemUpdate.error,
				'Failed to update item in the database '+ itemUpdate.error.message
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
		const deletedItem = await prisma.items.delete({ where: { id: itemId } });
        
        if (!deletedItem) return new ErrorHandler(
            'item',
            'Item not found',
            'Item not found in the database'
        )

		if (deletedItem.error)
			return new ErrorHandler(
				'prisma',
				'Failed to delete item from the database '+ deletedItem.error,
				'Failed to delete item from the database '+ deletedItem.error.message
			);
        
        const totalCount = await prisma.items.count();

        const meta = {
            totalCount: totalCount,
            deleted: deletedItem.count,
        }

		return { deletedItem: deletedItem, meta: meta};
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to remove item by id');
	}
};

export const removeAllItems = async () => {
	try {
		const deleteCount = await prisma.items.deleteMany();

		if (deleteCount.error)
			return new ErrorHandler(
				'prisma',
				'Failed to delete all items '+ deleteCount.error,
				'Failed to delete all items '+ deleteCount.error.message
			);

        const totalCount = await prisma.items.count();

        const meta = {
            totalCount: totalCount,
            deleted: deleteCount.count,
        }

		return { deleteCount : deleteCount, meta : meta};
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to remove all items');
	}
};



//*============================{For Items User Route}==================================

export const findItemsUserHas = async (userId, pagination) => {
	try {
		const { page, limit, offset } = pagination;

		const userItems = await prisma.items.findMany({
			where: { userId: userId },
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

		const itemsCount = await prisma.items.count({
			where: { userId: userId },
		});

		if (itemsCount.error)
			return new ErrorHandler(
				'prisma',
				'User has no item' || itemsCount.error,
				'There is no item to that user' || itemsCount.error.message
			);

		const meta = {
			total: itemsCount,
            totalSearch: userItems.length,
			page: page,
			limit: limit,
            offset: offset
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
		const item = await prisma.items.findUnique({
			where: { id: itemId, userId: userId },
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

		if (!item)
			return new ErrorHandler(
				'item',
				'Item not found',
				'Item not found in the database'
			);

		if (item.error)
			return new ErrorHandler(
				'prisma',
				'Failed to find item in the database '+item.error,
				'Failed to find item in the database '+item.error.message
			);

		return item;
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to find item user has');
	}
};

export const addItemToUser = async (userId, body) => {
	try {
		const { name, category, quantity, weight, volume, color, isFragile } =
			body;

		const item = await prisma.items.create({
			data: {
				name,
				category,
				quantity,
				weight,
				volume,
				color,
				isFragile,
				userId: userId,
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

		if (!item)
			return new ErrorHandler(
				'Item null',
				'Item not Created',
				'Item not created'
			);

		if (item.error)
			return new ErrorHandler(
				'prisma',
				'Failed to create item in the database '+item.error,
				'Failed to create item in the database '+item.error.message
			);

        const totalCount = await prisma.items.count({where: {userId: userId}})

        const meta = {
            totalCount: totalCount,
            created: 1
        };

		return { item: item, meta: meta };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to add item to user');
	}
};

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

		const createdItems = await prisma.items.createMany({
			data: items,
		});

        if(createdItems.error) return new ErrorHandler(
            'prisma',
            'Failed to create items in the database '+ createdItems.error,
            'Failed to create items in the database '+ createdItems.error.message
        )

        const totalCount = await prisma.items.count({where: {userId: userId}})

		const meta = {
			totalCount: totalCount,
            created: createdItems.count
		};

		return { createdItems: createdItems, meta: meta };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to add items to user');
	}
};

export const replaceItemUserHas = async (userId, itemId, body) => {
	try {
		const { name, category, weight, volume, color, isFragile, quantity } =
			body;

		const itemUpdate = await prisma.items.update({
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
					},
				},
			},
		});

        if (!itemUpdate) return new ErrorHandler(
            'item',
            'Item not found',
            'Item not found in the database'
        )

		if (itemUpdate.error)
			return new ErrorHandler(
				'prisma',
				'Failed to update item in the database '+itemUpdate.error,
				'Failed to update item in the database '+itemUpdate.error.message
			);

		return itemUpdate;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			error.message || 'Failed to replace item user has'
		);
	}
};

export const modifyItemUserHas = async (userId, itemId, body) => {
	try {
		const { name, category, weight, volume, color, isFragile, quantity } =
			body;

		const itemUpdate = await prisma.items.update({
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
					},
				},
			},
		});

        if (!itemUpdate) return new ErrorHandler(
            'item',
            'Item not found',
            'Item not found in the database'
        )

		if (itemUpdate.error)
			return new ErrorHandler(
				'prisma',
				'Failed to update item in the database '+ itemUpdate.error,
				'Failed to update item in the database '+ itemUpdate.error.message
			);

		return itemUpdate;
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			error.message || 'Failed to modify item user has'
		);
	}
};

export const removeAllItemsUserHas = async (userId) => {
	try {
		const deletedItems = await prisma.items.deleteMany({
			where: { userId: userId },
		});

		if (deletedItems.error)
			return new ErrorHandler(
				'prisma',
				'Failed to delete all items from the database '+deletedItems.error,
				'Failed to delete all items from the database '+deletedItems.error.message
			);

        const meta = {
            deleteCount: deletedItems.count,
            deleted: deletedItems.count
        };

		return { deletedItems: deletedItems, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all items user has'
		);
	}
};

export const removeItemUserHas = async (userId, itemId) => {
	try {
		const deletedItem = await prisma.items.delete({
			where: { id: itemId, userId: userId },
		});

        if (!deletedItem) return new ErrorHandler(
            'item',
            'Item not found',
            'Item not found in the database'
        )

		if (deletedItem.error)
			return new ErrorHandler(
				'prisma',
				'Failed to delete item from the database '+ deletedItem.error,
				'Failed to delete item from the database '+ deletedItem.error.message
			);
        
        const totalCount = await prisma.items.count({where: {userId: userId}})

        const meta = {
            deleteCount: totalCount,
            deleted: 1
        };

		return { deletedItem: deletedItem, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove item user has'
		);
	}
};



