import express from 'express';
import {
	VReqToUUID,
	VReqToCreateBag,
	VReqToModifyBag,
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
	getBagsBelongsToUser,
	getBagBelongsToUser,
	createBagForUser,
	replaceBagBelongsToUser,
	modifyBagBelongsToUser,
	deleteBagBelongsToUserById,
	deleteAllBagsBelongsToUser,
} from '../controllers/bagsController.js';

const bagsRoute = express.Router();

//* Validate request parameters

bagsRoute.param('bagId', (req, res, next, bagId) =>
	VReqToUUID(req, res, next, bagId, 'bagId')
);

//*=========================================={Base Bags Route}===================================

// //* route for get All bags => GET
// //* GET "/" → Get all bags
// bagsRoute.get('/', paginateMiddleware, orderByMiddleware, getAllBagsByQuery);

// //* route for get all bags by Querys => GET (query limit and pages)
// //* GET "/search" → Get bags by query
// //* Get all bags with optional search query
// bagsRoute.get(
// 	'/search',
// 	searchMiddleware,
// 	paginateMiddleware,
// 	orderByMiddleware,
// 	getAllBagsByQuery
// );

// //* route for get bag by id => GET (params id)
// //* GET "/:bagId" → Get a single bag by ID
// //* Get bag by ID
// bagsRoute.get('/:bagId', getBagById);

// //* route for replace (update) bag by id => PUT param(id)
// //* PUT /:bagId → Replace an bag (admin/member)
// //* Replace (update) an bag by ID
// bagsRoute.put(
// 	'/:bagId',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin', 'member'),
// 	VReqToCreateBag,
// 	replaceBagById
// );

// //* route for modify (update) bag by id => PATCH param(id)
// //* PATCH /:bagId → Modify an bag (admin/member)
// //* Modify (update) an bag by ID
// bagsRoute.patch(
// 	'/:bagId',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin', 'member'),
// 	VReqToModifyBag,
// 	modifyBagById
// );

// //* route for delete All bags => DELETE
// //* DELETE /delete-all → Delete all bags (admin only)
// //* Delete all bags (Admin only)
// bagsRoute.delete(
// 	'/delete-all',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin'),
// 	VReqToConfirmDelete,
// 	confirmDeleteMiddleware,
// 	deleteAllBags
// );

// //* route for delete bag by id => DELETE (params id)
// //* DELETE /:bagId → Delete an bag (admin/member)
// //* Delete an bag by ID
// bagsRoute.delete(
// 	'/:bagId',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin', 'member'),
// 	deleteBagById
// );

//*=========================================={Base Bags Route}===================================

//*=========================================={Bags Route For User}===================================

//* route to get bags that user has by user => GET user muet by login
//* GET /user → Get all bags for a user
//* Get bags that belong to a specific user option query
bagsRoute.get(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	searchMiddleware,
	paginateMiddleware,
	orderByMiddleware,
	getBagsBelongsToUser
);

//* route to get bag that user has by user id => GET (params id) user muet by login
//* GET /:bagId → Find a user’s bag by bag ID
//* Get bags that belong to a specific user
bagsRoute.get(
	'/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	getBagBelongsToUser
);

//* route for create bag for User => POST (params id) user muet by login
//* POST "/" → Create an bag for a user
//* Create a single bag for a user
bagsRoute.post(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToCreateBag,
	createBagForUser
);

//* route for replace (update) bag user has by id of the bag => PUT param(id)
//* PUT /:bagId → Replace a user’s bag
//* Replace an bag that belongs to a user
bagsRoute.put(
	'/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToCreateBag,
	replaceBagBelongsToUser
);

//* route for modify (update) bag by id of the bag => PATCH param(id)
//* PATCH /user/:bagId → Modify a user’s bag
//* Modify an bag that belongs to a user
bagsRoute.patch(
	'/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToModifyBag,
	modifyBagBelongsToUser
);

//* route for delete all bags By Search IF THERE that user has by user id => DELETE (params id) user muet by login
//* DELETE /user/all/ → Delete all user’s bags By Search
//* Delete all bags By Search that belong to a user
bagsRoute.delete(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	searchMiddleware,
	VReqToConfirmDelete,
	confirmDeleteMiddleware,
	deleteAllBagsBelongsToUser
);

//* route for delete bag user has by id of the bag => DELETE (params id) user muet by login
//* DELETE /user/:bagId → Delete a user’s bag
//* Delete a single bag that belongs to a user
bagsRoute.delete(
	'/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	deleteBagBelongsToUserById
);

//*=========================================={Bags Route For User}===================================

export default bagsRoute;
