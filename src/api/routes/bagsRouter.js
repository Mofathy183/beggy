import express from 'express';
import {
	VReqToUUID,
	VReqToCreateBag,
	VReqToModifyBag,
    VReqToBodyItemId,
    VReqToBodyItemsIds,
    VReqToBodyItemsIdsForDelete
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
	//*====={Bags User Router}=========
	getAllBagsByQuery,
	getBagById,
	replaceBagById,
	modifyBagById,
	deleteBagById,
	deleteAllBags,
	//*====={Bags User Router}=========
	//*====={Bags Router}=========
	getBagsBelongsToUser,
	getBagBelongsToUser,
	createBagForUser,
    createItemForUserBag,
    createItemsForUserBag,
	replaceBagBelongsToUser,
	modifyBagBelongsToUser,
	deleteBagBelongsToUserById,
	deleteAllBagsBelongsToUser,
    deleteItemsFromUserBag,
    deleteItemFromUserBag,
    deleteAllItemsFromUserBag,
	//*====={Bags Router}=========
} from '../controllers/bagsController.js';

const bagsRoute = express.Router();

//* Validate request parameters

bagsRoute.param('bagId', (req, res, next, bagId) =>
	VReqToUUID(req, res, next, bagId, 'bagId')
);

//*=========================================={Base Bags Route}===================================

//* route for get All bags => GET
//* GET "/" → Get all bags
bagsRoute.get('/', paginateMiddleware, orderByMiddleware, getAllBagsByQuery);

//* route for get all bags by Querys => GET (query limit and pages)
//* GET "/search" → Get bags by query
//* Get all bags with optional search query
bagsRoute.get(
	'/search',
	searchMiddleware,
	paginateMiddleware,
	orderByMiddleware,
	getAllBagsByQuery
);

//*========================{Bags Route For User}===================================
//* route to get bags that user has by user => GET user muet by login
//* GET /user → Get all bags for a user
//* Get bags that belong to a specific user option query
bagsRoute.get(
    '/user',
	VReqToHeaderToken,
	headersMiddleware,
	searchMiddleware,
	paginateMiddleware,
	orderByMiddleware,
	getBagsBelongsToUser
);
//*========================{Bags Route For User}===================================

//* route for get bag by id => GET (params id)
//* GET "/:bagId" → Get a single bag by ID
//* Get bag by ID
bagsRoute.get('/:bagId', getBagById);


//* route for replace (update) bag by id => PUT param(id)
//* PUT /:bagId → Replace an bag (admin/member)
//* Replace (update) an bag by ID
bagsRoute.put(
	'/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	VReqToCreateBag,
	replaceBagById
);

//* route for modify (update) bag by id => PATCH param(id)
//* PATCH /:bagId → Modify an bag (admin/member)
//* Modify (update) an bag by ID
bagsRoute.patch(
	'/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	VReqToModifyBag,
	modifyBagById
);

//* route for delete All bags => DELETE
//* DELETE /delete-all → Delete all bags (admin only)
//* Delete all bags (Admin only)
bagsRoute.delete(
    '/delete-all',
    VReqToHeaderToken,
    headersMiddleware,
    checkRoleMiddleware('admin'),
    confirmDeleteMiddleware,
    deleteAllBags
);

//* route for delete bag by id => DELETE (params id)
//* DELETE /:bagId → Delete an bag (admin/member)
//* Delete an bag by ID
bagsRoute.delete(
	'/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	deleteBagById
);

//*=========================================={Base Bags Route}===================================

//*=========================================={Bags Route For User}===================================


//* route to get bag that user has by user id => GET (params id) user muet by login
//* GET /user/:bagId → Find a user’s bag by bag ID
//* Get bags that belong to a specific user
bagsRoute.get(
	'/user/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	getBagBelongsToUser
);

//* route for create bag for User => POST (params id) user muet by login
//* POST "/user" → Create an bag for a user
//* Create a single bag for a user
bagsRoute.post(
	'/user',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToCreateBag,
	createBagForUser
);

//* route for create items for User Bag => POST (params id) user muet by login
//* POST "/user/items/:bagId" → Create multiple items for a user Bag
//* Create multiple items for a user Bag
bagsRoute.post(
    '/user/items/:bagId',
    VReqToHeaderToken,
    headersMiddleware,
    VReqToBodyItemsIds,
    createItemsForUserBag
);

//* route for create item for User Bag => POST (body itemId) (params id) user muet by login
//* POST "/user/item/:bagId" → Create an item for user Bag
//* Create a single item for a user Bag
bagsRoute.post(
    '/user/item/:bagId',
    VReqToHeaderToken,
    headersMiddleware,
    VReqToBodyItemId,
    createItemForUserBag
);


//* route for replace (update) bag user has by id of the bag => PUT param(id)
//* PUT /user/:bagId → Replace a user’s bag
//* Replace an bag that belongs to a user
bagsRoute.put(
	'/user/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToCreateBag,
	replaceBagBelongsToUser
);

//* route for modify (update) bag by id of the bag => PATCH param(id)
//* PATCH /user/:bagId → Modify a user’s bag
//* Modify an bag that belongs to a user
bagsRoute.patch(
	'/user/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToModifyBag,
	modifyBagBelongsToUser
);

//* route for delete all bags that user has by user id => DELETE (params id) user muet by login
//* DELETE /user/all → Delete all user’s bags
//* Delete all bags that belong to a user
bagsRoute.delete(
    '/user/all',
    VReqToHeaderToken,
    headersMiddleware,
    deleteAllBagsBelongsToUser
);

//* route for delete all bags By Search that user has by user id => DELETE (params id) user muet by login
//* DELETE /user/all/ → Delete all user’s bags By Search
//* Delete all bags By Search that belong to a user
bagsRoute.delete(
    '/user/all/search',
    VReqToHeaderToken,
    headersMiddleware,
    searchMiddleware,
    deleteAllBagsBelongsToUser
);

//* route for delete All Items From User's Bag => DELETE (params id) user muet by login
//* DELETE /user/items/all/:bagId → Delete All Item From User's Bag
//* Delete All Item From User's Bag
bagsRoute.delete(
    '/user/items/all/:bagId',
    VReqToHeaderToken,
    headersMiddleware,
    deleteAllItemsFromUserBag
);

//* route for delete Item By its Id From User's Bag => DELETE (params id) user muet by login
//* DELETE /user/item/:bagId → Delete Item By its Id From User's Bag
//* Delete Item By its Id From User's Bag
bagsRoute.delete(
    '/user/item/:bagId',
    VReqToHeaderToken,
    headersMiddleware,
    VReqToBodyItemId,
    deleteItemFromUserBag
);

//* route for delete Items By They Ids From User's Bag => DELETE (params id) user muet by login
//* DELETE /user/items/:bagId → Delete Items By They Ids From User's Bag
//* Delete Items By They Ids From User's Bag
bagsRoute.delete(
    '/user/items/:bagId',
    VReqToHeaderToken,
    headersMiddleware,
    VReqToBodyItemsIdsForDelete,
    deleteItemsFromUserBag
);

//* route for delete bag user has by id of the bag => DELETE (params id) user muet by login
//* DELETE /user/:bagId → Delete a user’s bag
//* Delete a single bag that belongs to a user
bagsRoute.delete(
	'/user/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	deleteBagBelongsToUserById
);

//*=========================================={Bags Route For User}===================================

export default bagsRoute;
