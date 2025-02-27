import express from 'express';
import {
	VReqToUUID,
	VReqToCreateItem,
	VReqToModifyItem,
	VReqToCreateManyItems,
} from '../../middlewares/validateRequest.js';
import {
	headersMiddleware,
	checkRoleMiddleware,
	VReqToHeaderToken,
	confirmDeleteMiddleware,
} from '../../middlewares/authMiddleware.js';
import {
	paginateMiddleware,
	searchMiddleware,
	orderByMiddleware,
} from '../../middlewares/middlewares.js';
import {
	//*====={items User Router}=========
	getItemsBelongsToUser,
	getItemBelongsToUser,
	createItemForUser,
	createItemsForUser,
	replaceItemBelongsToUser,
	modifyItemBelongsToUser,
	deleteItemBelongsTo,
	deleteAllItemsBelongsToUser,
	//*====={items User Router}=========
	//*====={items Router}=========
	getItemsById,
	getItemsByQuery,
	getAllItems,
	replaceItemById,
	modifyItemById,
	deleteItemById,
	deleteAllItems,
	//*====={items Router}=========
} from '../controllers/itemsController.js';

const itemsRoute = express.Router();

//* Validate request parameters
itemsRoute.param('id', (req, res, next, id) =>
	VReqToUUID(req, res, next, id, 'id')
);

itemsRoute.param('itemId', (req, res, next, itemId) =>
	VReqToUUID(req, res, next, itemId, 'itemId')
);

//*=========================================={Base Items Route}===================================

//todo: route for get All items => GET
//* GET "/" → Get all items
itemsRoute.get('/', paginateMiddleware, getAllItems);

//todo: route for get item by id => GET (params id)
//* GET "/:itemId" → Get a single item by ID
//* Get item by ID
itemsRoute.get('/:itemId', getItemsById);

//todo: route for get all items by Querys => GET (query limit and pages)
//* GET "/search" → Get items by query
//* Get all items with optional search query
itemsRoute.get(
	'/search',
	paginateMiddleware,
	searchMiddleware, // Applies search filters if any
	orderByMiddleware, // Applies sorting if any
	getItemsByQuery
);

//todo: route for replace (update) item by id => PUT param(id)
//* PUT /:itm → Replace an item (admin/member)
//* Replace (update) an item by ID
itemsRoute.put(
	'/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	VReqToCreateItem,
	replaceItemById
);

//todo: route for modify (update) item by id => PATCH param(id)
//* PATCH /:id → Modify an item (admin/member)
//* Modify (update) an item by ID
itemsRoute.patch(
	'/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	VReqToModifyItem,
	modifyItemById
);

//todo: route for delete item by id => DELETE (params id)
//* DELETE /:id → Delete an item (admin/member)
//* Delete an item by ID
itemsRoute.delete(
	'/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	deleteItemById
);

//todo: route for delete All Items => DELETE
//* DELETE /delete-all → Delete all items (admin only)
//* Delete all items (Admin only)
itemsRoute.delete(
	'/delete-all',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin'),
	confirmDeleteMiddleware,
	deleteAllItems
);

//*=========================================={Base Items Route}===================================

//*=========================================={Items Route For User}===================================

//todo: route to get items that user has by user => GET user muet by login
//* GET /user → Get all items for a user
//* Get items that belong to a specific user
itemsRoute.get(
	'/user',
	VReqToHeaderToken,
	headersMiddleware,
	paginateMiddleware,
	getItemsBelongsToUser
);

//todo: route to get item that user has by user id => GET (params id) user muet by login
//* PUT /user/:itemId → Replace a user’s item
//* Get items that belong to a specific user
itemsRoute.get(
	'/user/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	paginateMiddleware,
	getItemBelongsToUser
);

//todo: route for create item for User => POST (params id) user muet by login
//* POST "/user/:id" → Create an item for a user
//* Create a single item for a user
itemsRoute.post(
	'/user',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToCreateItem,
	createItemForUser
);

//todo: route for create items for User => POST (params id) user muet by login
//* POST "/user/multiple" → Create multiple items for a user
//* Create multiple items for a user
itemsRoute.post(
	'/user/multiple',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToCreateManyItems,
	createItemsForUser
);

//todo: route for replace (update) item user has by id of the item => PUT param(id)
//* PUT /user/:itemId → Replace a user’s item
//* Replace an item that belongs to a user
itemsRoute.put(
	'/user/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToCreateItem,
	replaceItemBelongsToUser
);

//todo: route for modify (update) item by id of the item => PATCH param(id)
//* PATCH /user/:itemId → Modify a user’s item
//* Modify an item that belongs to a user
itemsRoute.patch(
	'/user/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToModifyItem,
	modifyItemBelongsToUser
);

//todo: route for delete item user has by id of the item => DELETE (params id) user muet by login
//* DELETE /user/:itemId → Delete a user’s item
//* Delete a single item that belongs to a user
itemsRoute.delete(
	'/user/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	deleteItemBelongsTo
);

//todo: route for delete all items that user has by user id => DELETE (params id) user muet by login
//* DELETE /user/all → Delete all user’s items
//* Delete all items that belong to a user
itemsRoute.delete(
	'/user/all',
	VReqToHeaderToken,
	headersMiddleware,
	deleteAllItemsBelongsToUser
);

//*=========================================={Items Route For User}===================================

export default itemsRoute;
