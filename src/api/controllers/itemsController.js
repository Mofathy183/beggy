import { 
    findItemsUserHas,
    findItemUserHas,
    addItemToUser,
    addItemsToUSer,
    findItemById,
    findItemsByQuery,
    findAllItems,
    removeAllItems,
    removeItemUserHas,
    removeAllItemsUserHas,
    replaceItemResource,
    modifyItemResource,
    replaceItemUserHas,
    modifyItemUserHas,
} from '../../services/itemsService.js';
import { statusCode } from '../../config/status.js';
import { sendCookies, storeSession } from '../../utils/authHelper.js';
import { ErrorResponse } from '../../utils/error.js';
import SuccessResponse from '../../utils/successResponse.js';

export const createItemForUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { body } = req;

        const { item, role } = await addItemToUser(id, body);

        console.log(item, role);

        if (!role) return next(new ErrorResponse(
            "role is not defined",
            "Role not defined",
            statusCode.badRequestCode
        ));

        if (!item) return next(new ErrorResponse(
            "Item is not defined",
            "Item not defined",
            statusCode.badRequestCode
        ));

        if (item.error) return next(new ErrorResponse(
            item.error,
            "Failed to create item for user",
            statusCode.badRequestCode
        ))

        sendCookies(id, res);
        storeSession(id, role, req);

        return next(new SuccessResponse(
            statusCode.createdCode,
            "Item created successfully and add it to user",
            item,
        ));
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                "Failed to Create item for User",
                statusCode.internalServerErrorCode
            )
        );
    }
}


export const createItemsForUser = async (req, res, next) => {
    try {
        const { id: userId } = req.params;
        const { body } = req;

        const { createdItems, meta } = await addItemsToUSer(userId, body);

        if (!createdItems || createdItems.length === 0) {
            return next(
                new ErrorResponse(
                    "No items provided" ||  createdItems.error,
                    "No items were created",
                    statusCode.badRequestCode
                )
            )
        };

        if (createdItems.error) return next(
            new ErrorResponse(
                createdItems.error,
                "Failed to create items for user",
                statusCode.badRequestCode
            )
        );

        if (meta.totalCount === 0) return next(
            new ErrorResponse(
                "No items found add to user list",
                "No items were found",
                statusCode.notFoundCode
            )
        )

        sendCookies(userId, res);

        storeSession(userId, req.session.userRole, req);

        return next(
            new SuccessResponse(
                statusCode.createdCode,
                "Items created successfully and added to user",
                createdItems,
                meta,
            )
        )
    } 

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                "Failed to Create items for User",
                statusCode.internalServerErrorCode
            )
        );
    }
}

export const getItemsBelongsToUser = async (req, res, next) => {
	try {
		const { pagination } = req;
        const { userId, userRole } = req.session;

		const { userItems, meta } = await findItemsUserHas(userId, pagination);

		if (userItems.error)
			next(
				new ErrorResponse(
					'Error finding items' || userItems.error,
					"Couldn't find items user has" || userItems.error.message,
					statusCode.badRequestCode
				)
			);

		sendCookies(userId, res), 
        storeSession(userId, userRole, req);

		return next(
			new SuccessResponse(
				statusCode.okCode,
				'Successfully found items user has',
				userItems,
				meta
			)
		);
	} catch (error) {
		return next(
			new ErrorResponse(
				error,
				'Failed to get items Belongs to user',
				statusCode.internalServerErrorCode
			)
		);
	}
};


export const getItemBelongsToUser = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { userId, userRole } = req.session;

        const item = await findItemUserHas(userId, itemId);

        if (item.error)
            return next(
                new ErrorResponse(
                    'Error finding item' || item.error,
                    "Couldn't find item user has" || item.error.message,
                    statusCode.badRequestCode
                )
            );

        sendCookies(userId, res), 
        storeSession(userId, userRole, req);

        return next(
            new SuccessResponse(
                statusCode.okCode,
                'Successfully found item user has',
                item
            )
        );
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to get item Belongs to user',
                statusCode.internalServerErrorCode
            )
        );
    }
};


export const getItemsById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const item = await findItemById(id);

        if (!item) return next(
            new ErrorResponse(
                'Item not found',
                'Failed to find item by id',
                statusCode.notFoundCode
            )
        );

        if (!item.error) return next(
            new ErrorResponse(
                item.error || 'Failed to find item by id',
                'Failed to find item by id',
                statusCode.internalServerErrorCode
            )
        );
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to get item by id',
                statusCode.internalServerErrorCode
            )
        );
    }
}


export const getItemsByQuery = async (req, res, next) => {
    try {
        const { pagination, itemsSearch } = req;

        const { items, meta } = await findItemsByQuery(pagination, itemsSearch);

        if (!items.error) return next(
            new ErrorResponse(
                items.error || 'Failed to find all items',
                'Failed to find all items',
                statusCode.internalServerErrorCode
            )
        );

        sendCookies(req.session.userId, res)
        storeSession(req.session.userId, req.session.userRole, req);

        return next(
            new SuccessResponse(
                statusCode.okCode,
                'Successfully found all items',
                items,
                meta
            )
        );
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to get all items',
                statusCode.internalServerErrorCode
            )
        );
    }
}


export const getAllItems = async (req, res, next) => {
    try {
        const { pagination } = req;

        const { items, meta } = await findAllItems(pagination);

        if (!items.error) return next(
            new ErrorResponse(
                items.error || 'Failed to find all items',
                'Failed to find all items',
                statusCode.internalServerErrorCode
            )
        );

        sendCookies(req.session.userId, res)
        storeSession(req.session.userId, req.session.userRole, req);

        return next(
            new SuccessResponse(
                statusCode.okCode,
                'Successfully found all items',
                items,
                meta
            )
        );
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to get all items',
                statusCode.internalServerErrorCode
            )
        );
    }
}


export const replaceItemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { body } = req;

        const itemUpdate = await replaceItemResource(id, body);

        if (itemUpdate.error) return next(
            new ErrorResponse(
                itemUpdate.error,
                "Failed to replace item by id",
                statusCode.badRequestCode
            ))

        sendCookies(req.session.userId, res)
        storeSession(req.session.userId, req.session.userRole, req);

        return next(
            new SuccessResponse(
                statusCode.okCode,
                'Successfully replaced item by id',
                itemUpdate
            )
        )
    }

    catch (error) { 
        return next(
            new ErrorResponse(
                error,
                'Failed to replace item by id',
                statusCode.internalServerErrorCode
            )
        );
    }
}


export const modifyItemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { body } = req;

        const itemUpdate = await modifyItemResource(id, body);

        if (itemUpdate.error) return next(
            new ErrorResponse(
                itemUpdate.error,
                "Failed to modify item by id",
                statusCode.badRequestCode
            ))

        sendCookies(req.session.userId, res)
        storeSession(req.session.userId, req.session.userRole, req);

        return next(
            new SuccessResponse(
                statusCode.okCode,
                'Successfully modified item by id',
                itemUpdate
            )
        )
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to modify item by id',
                statusCode.internalServerErrorCode
            )
        );
    }
}


export const replaceItemBelongsToUser = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { body } = req;

        const itemUpdate = await replaceItemUserHas(req.session.userId, itemId, body);

        if (itemUpdate.error) return next(
            new ErrorResponse(
                itemUpdate.error,
                "Failed to replace item Belongs to user",
                statusCode.badRequestCode
            )
        );

        sendCookies(req.session.userId, res)
        storeSession(req.session.userId, req.session.userRole, req);

        return next(
            new SuccessResponse(
                statusCode.okCode,
                'Successfully replaced item Belongs to user',
                itemUpdate
            )
        );
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to replace item Belongs to user',
                statusCode.internalServerErrorCode
            )
        );
    }
}


export const modifyItemBelongsToUser = async (req, res, next) => {
    try {
        const { itemId } = req.params;
        const { body } = req;

        const itemUpdate = await modifyItemUserHas(req.session.userId, itemId, body);

        if (itemUpdate.error) return next(
            new ErrorResponse(
                itemUpdate.error,
                "Failed to modify item Belongs to user",
                statusCode.badRequestCode
            )
        );

        sendCookies(req.session.userId, res)
        storeSession(req.session.userId, req.session.userRole, req);

        return next(
            new SuccessResponse(
                statusCode.okCode,
                'Successfully modified item Belongs to user',
                itemUpdate
            )
        );
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to modify item Belongs to user',
                statusCode.internalServerErrorCode
            )
        );
    }
}



export const deleteAllItemsBelongsToUser = async (req, res, next) => {
    try {
        const { userId } = req.session;

        const deleteCount = await removeAllItemsUserHas(userId);

        if (deleteCount.error) return next(
            new ErrorResponse(
                deleteCount.error || 'Failed to delete all items Belongs to user',
                'Failed to delete all items Belongs to user',
                statusCode.internalServerErrorCode
            )
        )

        sendCookies(req.session.userId, res)
        storeSession(req.session.userId, req.session.userRole, req);

        return next(
            new SuccessResponse(
                statusCode.okCode,
                'Successfully deleted all items Belongs to user',
                deleteCount
            )
        );
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to delete all items Belongs to user',
                statusCode.internalServerErrorCode
            )
        );
    }
}


export const deleteItemBelongsTo = async (req, res, next) => {
    try {
        const { itemId } = req.params;

        const deleteCount = await removeItemUserHas(req.session.userId, itemId);

        if (deleteCount.error) return next(
            new ErrorResponse(
                deleteCount.error || 'Failed to delete item Belongs to user',
                'Failed to delete item Belongs to user',
                statusCode.internalServerErrorCode
            )
        )

        sendCookies(req.session.userId, res)
        storeSession(req.session.userId, req.session.userRole, req);

        return next(
            new SuccessResponse(
                statusCode.okCode,
                'Successfully deleted item Belongs to user',
                deleteCount
            )
        )
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to delete item Belongs to user',
                statusCode.internalServerErrorCode
            )
        );
    }
}


export const deleteItemById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deleteCount = await deleteItemById(id);

        if (deleteCount.error) return next(
            new ErrorResponse(
                deleteCount.error || 'Failed to delete item by id',
                'Failed to delete item by id',
                statusCode.internalServerErrorCode
            )
        )

        sendCookies(req.session.userId, res)
        storeSession(req.session.userId, req.session.userRole, req);

        return next(
            new SuccessResponse(
                statusCode.okCode,
                'Successfully deleted item by id',
                deleteCount
            )
        )
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to delete item by id',
                statusCode.internalServerErrorCode
            )
        );
    }
}


export const deleteAllItems = async (req, res, next) => {
    try {
        const deleteCount = await removeAllItems();

        if (deleteCount.error) return next(
            new ErrorResponse(
                deleteCount.error || 'Failed to delete all items',
                'Failed to delete all items',
                statusCode.internalServerErrorCode
            )
        )

        sendCookies(req.session.userId, res)
        storeSession(req.session.userId, req.session.userRole, req);

        return next(
            new SuccessResponse(
                statusCode.okCode,
                'Successfully deleted all items',
                deleteCount
            )
        )
    }

    catch (error) {
        return next(
            new ErrorResponse(
                error,
                'Failed to delete all items',
                statusCode.internalServerErrorCode
            )
        );
    }
}