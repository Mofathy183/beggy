import { ErrorHandler } from '../utils/error.js';
import prisma from '../../prisma/prisma.js';

export const findAllBagsByQuery = async (searchFilter, pagination, orderBy) => {
	try {
		const { page, limit, offset } = pagination;

        const bags = await prisma.bags.findMany({
            where: searchFilter,
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
                createdAt: true,
                updatedAt: true,
                userId: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        displayName: true
                    },
                },
                bagItems: true,
            },
            take: limit,
            skip: offset,
            orderBy: orderBy,
        })

		if (bags.error)
			return new ErrorHandler(
				'prisma',
				bags.error,
				'Failed to find bags in the database '+bags.error.message
			);

        const totalCount = await prisma.bags.count()

		const meta = {
			totalCount: totalCount,
            totalFind: bags.length,
			page: page,
			limit: limit,
			offset: offset,
			searchFilter: searchFilter,
			orderBy: orderBy,
		};

		return { bags: bags, meta: meta };
	} catch (error) {
		new ErrorHandler('catch', error, 'Failed to get all bags');
	}
};

export const findBagById = async (bagId) => {
	try {
		const bag = await prisma.bags.findUnique({
			where: { id: bagId },
			omit: {
				user: true,
				userId: true,
                bagItems: true
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
				'Failed to find bag in the database '+bag.error.message
			);

        const totalCount = await prisma.bags.count();

        const meta = {
            totalCount: totalCount,
            totalFind: bag ? 1 : 0,
        }

		return { bag: bag, meta: meta };
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
			omit: {
				user: true,
				bagItems: true,
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
				'Failed to update bag in the database '+bagUpdate.error.message
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
			omit: {
				user: true,
				bagItems: true,
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
				'Failed to update bag in the database '+bagUpdate.error.message
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
				'Failed to delete bag in the database '+bagDelete.error.message
			);

        const totalCount = await prisma.bags.count()

        const meta = {
            totalCount: totalCount,
            totalDelete: bagDelete ? 1 : 0,
        };

		return { bagDelete: bagDelete, meta: meta };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to remove bag by id');
	}
};

export const removeAllBags = async () => {
	try {
		const deleteCount = await prisma.bags.deleteMany({ where: {} });

		if (deleteCount.error)
			return new ErrorHandler(
				'prisma',
				deleteCount.error,
				'Failed to delete all bags from the database'
			);

        const meta = {
            totalCount: deleteCount.count,
            totalDelete: deleteCount.count,
        };

		return { deleteCount: deleteCount, meta: meta };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to remove all bags');
	}
};


//*========================={Bags Route For User}=====================================

export const findBagsUserHas = async (userId, searchFilter, pagination, orderBy) => {
    try{
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
                bagItems: true 
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
				'Failed to find bags in the database '+ userBags.error.message
			);

        const totalCount = await prisma.bags.count({ where: { userId: userId } });

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

        const totalCount = await prisma.bags.count({ where: { userId: userId } });

        const meta = {
            totalCount: totalCount,
            totalFind: userBag ? 1 : 0,
        }

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
				'Failed to create bag in the database '+newBag.error.message
			);

        const totalCount = await prisma.bags.count({ where: { userId: userId } });

        const meta = {
            totalCount: totalCount,
            totalCreate: newBag ? 1 : 0,
        }

		return { meta: meta, newBag: newBag };
	} catch (error) {
		return new ErrorHandler('catch', error, 'Failed to add bag to user');
	}
};

export const addItemToUserBag = async (userId, bagId, body) => {
    try {
        const { itemId } = body;

        const bag = await prisma.bags.findUnique({
            where: { userId: userId, id: bagId },
        });

        if (!bag) return new ErrorHandler(
            'bag not found', 
            'Failed to find bag in the database', 
            'prisma Error'
        );

        if (bag.error) return new ErrorHandler(
            'prisma', 
            bag.error, 
            'Failed to find bag in the database '+bag.error.message
        );

        const userItem = await prisma.items.findUnique({
            where: { userId: userId, id: itemId },
        });

        if (!userItem) return new ErrorHandler(
            'item not found', 
            'Failed to find item in the database', 
            'prisma Error'
        );

        if (userItem.error) return new ErrorHandler(
            'prisma', 
            userItem.error, 
            'Failed to find item in the database '+userItem.error.message
        );

        if (
            !(bag.capacity >= ( (userItem.volume * userItem.quantity) / 100 )) 
            && 
            !(bag.weight >= ( (userItem.weight * userItem.quantity) / 100 ) )
        ) return new ErrorHandler(
            'bag capacity or weight exceeded', 
            'The bag does not have enough capacity or weight to accommodate the item', 
            'Bag capacity or weight exceeded'
        );

        const bagItem = await prisma.bagItems.upsert({
            where: { 
                bagId_itemId: { bagId, itemId }
            },
            update: { 
                itemId: itemId
            },
            create: {                
                bagId: bagId, 
                itemId: itemId
            }
        });

        if (!bagItem) return new ErrorHandler(
            'item not added in Bag', 
            'Failed to add item to the bag in the database', 
            'prisma Error'
        );

        if (bagItem.error) return new ErrorHandler(
            'prisma', 
            bagItem.error, 
            'Failed to add item to the bag in the database '+bagItem.error.message
        );

        
        const userBag = await prisma.bags.findUnique({
            where: { userId: userId, id: bagId },
            include: {
                bagItems:{
                    select: {
                        item: true
                    }
                }
            }
        });

        if (!userBag) return new ErrorHandler(
            'bag is not full', 
            'The bag has enough capacity and weight to accommodate the item', 
            'Bag is not full'
        );
        
        if (userBag.error) return new ErrorHandler(
            'prisma', 
            userBag.error, 
            'Failed to find bag in the database '+userBag.error.message
        )
        
        if (userBag.isWeightExceeded || userBag.isCapacityExceeded) return new ErrorHandler(
            'bag is exceeded capacity and weight', 
            'Cannot add that item to bag ', 
            'The bag will be exceeded capacity and weight if you add that item'
        );
        
        
        const totalCount = await prisma.bagItems.count({
            where: {
                bagId: bagId,
            }
        })

        const meta = {
            totalCount: totalCount,
            totalAdd: bagItem ? 1 : 0,
        }

        return {userBag: userBag, meta: meta};
    }

    catch (error) {
        return new ErrorHandler(
            'catch', 
            error, 
            'Failed to add item to user bag'
        );
    }
}

export const addItemsToUserBag = async (userId, bagId, body) => {
    try {
        const bag = await prisma.bags.findUnique({
            where: { id: bagId, userId: userId },
        });

        if (!bag) return new ErrorHandler(
            'bag not found', 
            'Failed to find bag in the database', 
            'prisma Error'
        );

        if (bag.error) return new ErrorHandler(
            'prisma', 
            bag.error, 
            'Failed to find bag in the database '+bag.error.message, 
        );

        const userItems = await prisma.items.findMany({
            where: { userId: userId },
        });

        if (!userItems) return new ErrorHandler(
            'items not found', 
            'Failed to find items in the database', 
            'prisma Error'
        );

        if (userItems.error) return new ErrorHandler(
            'prisma', 
            userItems.error, 
            'Failed to find items in the database '+userItems.error.message, 
        );

        const userItemsIds = userItems.map((item, index) => {
            let itemId = body.itemsIds[index].itemId;
            let canFit = bag.capacity >= item.volume && bag.weight >= item.weight;

            return canFit ? { itemId } : {};
        })

        if (userItemsIds.length === 0) return new ErrorHandler(
            'bag capacity or weight exceeded', 
            'The bag does not have enough capacity or weight to accommodate all the items', 
            'Bag capacity or weight exceeded'
        );

        const bagItems = await prisma.bagItems.createMany({
            data: userItemsIds.map((item) => ({
                bagId,
                itemId: item.itemId,
            })),
            skipDuplicates: true,
        });

        if (bagItems.error) return new ErrorHandler(
            'prisma', 
            bagItems.error, 
            'Failed to add items to the bag in the database '+bagItems.error.message
        );

        const isBagFull = await prisma.bags.findUnique({
            where: {id: bagId},
            include: {
                bagItems: {
                    select: {
                        item: true,
                    }
                }
            }
        })

        if (isBagFull.isWeightExceeded || isBagFull.isCapacityExceeded) return new ErrorHandler(
            'bag is exceeded capacity and weight', 
            'Cannot add those items to bag ', 
            'The bag will be exceeded capacity and weight if you add those items'
        );

        const totalCount = await prisma.bagItems.count({
            where: {
                bagId: bagId,
            }
        })

        const meta = {
            totalCount: totalCount,
            totalAdd: bagItems ? bagItems.count : 0,
        }

        return { bagItems: isBagFull, meta: meta };
    }

    catch (error) {
        return new ErrorHandler(
            'catch', 
            error, 
            'Failed to add items to user bag'
        );
    }
}

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
                    }
                }
            }
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
				'Failed to update bag in the database '+updatedBag.error.message
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
            removeFeatures
		} = body;

        const bag = await prisma.bags.findUnique({
            where: {id: bagId, userId: userId},
            select: {
                userId: true,
                features: true
            }
        });

        if (!bag) return new ErrorHandler(
            'bag not found', 
            'Failed to find bag in the database', 
            'prisma Error'
        );

        if (bag.error) return new ErrorHandler(
            'prisma', 
            bag.error, 
            'Failed to find bag in the database '+bag.error.message, 
        );

        // Normalize `removeFeatures` for case-insensitive matching
        let removeSet = [...new Set([...removeFeatures.map(f => f.toUpperCase())])];
        console.log("Removing features: ", removeSet);

        // Filter out features that need to be removed
        let newFeatures = bag.features?.filter(f => !removeSet.includes(f.toUpperCase())) || [];
        console.log("New features: ", newFeatures);

        // Convert `features` to uppercase to match `bag.features`
        let updatedFeatures = [...new Set([...features.map(f => f.toUpperCase()), ...newFeatures])];
        console.log("Updated features: ", updatedFeatures);

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
				features: features.length || newFeatures.length 
                ? updatedFeatures
                : undefined,
			},
            include: {
                bagItems: {
                    select: {
                        item: true,
                    }
                }
            }
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
				'Failed to modify bag in the database '+updatedBag.error.message
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
				'Failed to delete bag from the database '+deletedBag.error.message
			);

        const totalCount = await prisma.bags.count( { where: { userId: userId } } );

        const meta = {
            totalCount: totalCount,
            totalDelete: deletedBag ? 1 : 0,
        }

		return { deletedBag: deletedBag, meta: meta };
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove bag user has by id'
		);
	}
};

export const removeItemFromUserBag = async (userId, bagId, body) => {
    try {
        const { itemId } = body;

        const deletedBagItem = await prisma.bagItems.delete({
            where: { bagId_itemId: { bagId, itemId } },
        });

        if (!deletedBagItem)
            return new ErrorHandler(
                'bag item not deleted',
                'Failed to delete item from the database',
                'prisma Error'
            );

        if (deletedBagItem.error)
            return new ErrorHandler(
                'prisma',
                deletedBagItem.error,
                'Failed to delete item from the database '+deletedBagItem.error.message
            );

        const bagItems = await prisma.bags.findUnique({
            where: { id: bagId, userId: userId },
            include: {
                bagItems: {
                    select: {
                        item: true,
                    }
                }
            }
        });

        const totalCount = await prisma.bagItems.count({where: {bagId: bagId}});

        const meta = {
            totalCount: totalCount,
            totalDelete: deletedBagItem ? 1 : 0,
        }

        return { bagItems: bagItems, meta: meta };
    }

    catch (error) {
        return new ErrorHandler(
            "Catch",
            error,
            "Failed to remove item from user bag"
        )
    }
}

export const removeItemsFromUserBag = async(userId, bagId, body) => {
    try {
        const { itemIds } = body;

        const deletedBagItems = await prisma.bagItems.deleteMany({
            where: {
                itemId: { in: itemIds },
                bagId: bagId,
            },
        });

        if (deletedBagItems.error)
            return new ErrorHandler(
                'prisma',
                deletedBagItems.error,
                'Failed to delete items from the database '+deletedBagItems.error.message
            );

        const bagItems = await prisma.bags.findUnique({
            where: { id: bagId, userId: userId },
            include: {
                bagItems: {
                    select: {
                        item: true,
                    }
                }
            }
        })

        const totalCount = await prisma.bagItems.count({
            where: {
                bagId: bagId,
            }
        })

        const meta = {
            totalCount: totalCount,
            totalDelete: deletedBagItems.count,
        }

        return { bagItems: bagItems, meta: meta };
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            'Failed to remove items from user bag'
        );
    }
}

export const removeAllItemsFromUserBag = async (userId, bagId) => {
    try {
        const deletedBagItems = await prisma.bagItems.deleteMany({
            where: {
                bagId: bagId,
            },
        });

        if (deletedBagItems.error)
            return new ErrorHandler(
                'prisma',
                deletedBagItems.error,
                'Failed to delete all items from the database '+deletedBagItems.error.message
            );

        const bagItems = await prisma.bags.findUnique({
            where: { id: bagId, userId: userId },
            include: {
                bagItems: {
                    select: {
                        item: true,
                    }
                }
            }
        })

        const totalCount = await prisma.bagItems.count({
            where: {
                bagId: bagId,
            }
        })

        const meta = {
            totalCount: totalCount,
            totalDelete: deletedBagItems.count,
        }

        return { bagItems: bagItems, meta: meta };
    }

    catch (error) {
        return new ErrorHandler(
            'catch',
            error,
            'Failed to remove all items from user bag'
        );
    }
}

export const removeAllBagsUserHas = async (userId, searchFilter) => {
	try {
		const deletedBags = await prisma.bags.deleteMany({
            where: { 
                ...searchFilter,
                userId: userId
            },
		});

		if (deletedBags.error)
			return new ErrorHandler(
				'prisma',
				deletedBags.error,
				'Failed to delete all bags from the database '+deletedBags.error.message
			);
        
        const totalCount = await prisma.bags.count( { where: { userId: userId } } );

        const meta = {
            totalCount: totalCount,
            totalDelete: deletedBags.count,
        }

		return { deletedBags: deletedBags, meta: meta};
	} catch (error) {
		return new ErrorHandler(
			'catch',
			error,
			'Failed to remove all bags user has'
		);
	}
};
