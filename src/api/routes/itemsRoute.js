import express from 'express';
import {
	VReqToUUID,
	VReqToCreateItem,
	VReqToModifyItem,
	VReqToCreateManyItems,
} from '../../middlewares/validateRequest.js';
import {
	headersMiddleware,
	VReqToHeaderToken,
	confirmDeleteMiddleware,
	VReqToConfirmDelete,
} from '../../middlewares/authMiddleware.js';
import {
	paginateMiddleware,
	searchMiddleware,
	orderByMiddleware,
} from '../../middlewares/middlewares.js';
import {
	getItemsBelongsToUser,
	getItemBelongsToUser,
	createItemForUser,
	createItemsForUser,
	replaceItemBelongsToUser,
	modifyItemBelongsToUser,
	deleteItemBelongsTo,
	deleteAllItemsBelongsToUser,
} from '../controllers/itemsController.js';

const itemsRoute = express.Router();

//* Validate request parameters
itemsRoute.param('itemId', (req, res, next, itemId) =>
	VReqToUUID(req, res, next, itemId, 'itemId')
);


//* route to get items that user has by search IF THERE => GET user muet by login
//* GET / → Get all items for a user by Query OR ALL items 
//* Get items that belong to a specific user
itemsRoute.get(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	paginateMiddleware,
    searchMiddleware,
    orderByMiddleware,
	getItemsBelongsToUser
);

//* route to get item that user has by user id => GET (params id) user muet by login
//* PUT /:itemId → Replace a user’s item
//* Get items that belong to a specific user
itemsRoute.get(
	'/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	getItemBelongsToUser
);

//* route for create item for User => POST (params id) user muet by login
//* POST "/:id" → Create an item for a user
//* Create a single item for a user
itemsRoute.post(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToCreateItem,
	createItemForUser
);

//* route for create items for User => POST (params id) user muet by login
//* POST "/multiple" → Create multiple items for a user
//* Create multiple items for a user
itemsRoute.post(
	'/multiple',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToCreateManyItems,
	createItemsForUser
);

//* route for replace (update) item user has by id of the item => PUT param(id)
//* PUT /:itemId → Replace a user’s item
//* Replace an item that belongs to a user
itemsRoute.put(
	'/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToCreateItem,
	replaceItemBelongsToUser
);

//* route for modify (update) item by id of the item => PATCH param(id)
//* PATCH /:itemId → Modify a user’s item
//* Modify an item that belongs to a user
itemsRoute.patch(
	'/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToModifyItem,
	modifyItemBelongsToUser
);

//* route for delete all items that user has by user id => DELETE (params id) user muet by login
//* DELETE / → Delete all user’s items
//* Delete all items that belong to a user
itemsRoute.delete(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
    searchMiddleware,
	VReqToConfirmDelete,
	confirmDeleteMiddleware,
	deleteAllItemsBelongsToUser
);

//* route for delete item user has by id of the item => DELETE (params id) user muet by login
//* DELETE /:itemId → Delete a user’s item
//* Delete a single item that belongs to a user
itemsRoute.delete(
	'/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	deleteItemBelongsTo
);


export default itemsRoute;
