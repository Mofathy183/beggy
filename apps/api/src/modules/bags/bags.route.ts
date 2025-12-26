import express from 'express';
import {
	VReqToUUID,
	VReqToCreateBag,
	VReqToModifyBag,
} from '../../middlewares/validateRequest.js';
import {
	headersMiddleware,
	checkPermissionMiddleware,
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

//*======================================={BAG ME Route}==============================================

//* Validate request parameters

bagsRoute.param('bagId', (req, res, next, bagId) =>
	VReqToUUID(req, res, next, bagId, 'bagId')
);

//* route to get bags that user has by user => GET user must by login
//* GET /user → Get all bags for a user
//* Get bags that belong to a specific user option query
bagsRoute.get(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('read:own', 'bag'),
	searchMiddleware,
	paginateMiddleware,
	orderByMiddleware,
	getBagsBelongsToUser
);

//* route to get bag that user has by user id => GET (params id) user must by login
//* GET /:bagId → Find a user’s bag by bag ID
//* Get bags that belong to a specific user
bagsRoute.get(
	'/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('read:own', 'bag'),
	getBagBelongsToUser
);

//* route for create bag for User => POST (params id) user must by login
//* POST "/" → Create an bag for a user
//* Create a single bag for a user
bagsRoute.post(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('create:own', 'bag'),
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
	checkPermissionMiddleware('update:own', 'bag'),
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
	checkPermissionMiddleware('update:own', 'bag'),
	VReqToModifyBag,
	modifyBagBelongsToUser
);

//* route for delete all bags By Search IF THERE that user has by user id => DELETE (params id) user must by login
//* DELETE /user/all/ → Delete all user’s bags By Search
//* Delete all bags By Search that belong to a user
bagsRoute.delete(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('delete:own', 'bag'),
	searchMiddleware,
	VReqToConfirmDelete,
	confirmDeleteMiddleware,
	deleteAllBagsBelongsToUser
);

//* route for delete bag user has by id of the bag => DELETE (params id) user must by login
//* DELETE /user/:bagId → Delete a user’s bag
//* Delete a single bag that belongs to a user
bagsRoute.delete(
	'/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('delete:own', 'bag'),
	deleteBagBelongsToUserById
);
export default bagsRoute;
//*======================================={BAG ME Route}==============================================

//*======================================={Bags Private Route}==============================================

// //* route for replace (update) bag by id => PUT param(id)
// //* PUT /bags/:bagId → Replace an bag (admin/member)
// //* Replace (update) an bag by ID
// privateRoute.put(
// 	'/bags/:bagId',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin', 'member'),
// 	checkPermissionMiddleware('update:any', 'bag'),
// 	VReqToCreateBag,
// 	replaceBagById
// );

// //* route for modify (update) bag by id => PATCH param(id)
// //* PATCH /bags/:bagId → Modify an bag (admin/member)
// //* Modify (update) an bag by ID
// privateRoute.patch(
// 	'/bags/:bagId',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin', 'member'),
// 	checkPermissionMiddleware('update:any', 'bag'),
// 	VReqToModifyBag,
// 	modifyBagById
// );

// //* route for delete All bags => DELETE
// //* DELETE /bags → Delete all bags (admin only)
// //* Delete all bags (Admin only)
// privateRoute.delete(
// 	'/bags',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	searchMiddleware,
// 	checkRoleMiddleware('admin'),
// 	checkPermissionMiddleware('delete:any', 'bag'),
// 	VReqToConfirmDelete,
// 	confirmDeleteMiddleware,
// 	deleteAllBags
// );

// //* route for delete bag by id => DELETE (params id)
// //* DELETE /bags/:bagId → Delete an bag (admin/member)
// //* Delete an bag by ID
// privateRoute.delete(
// 	'/bags/:bagId',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin', 'member'),
// 	checkPermissionMiddleware('delete:any', 'bag'),
// 	deleteBagById
// );

//*======================================={Bags Private Route}==============================================

//*======================================={Bags Public Route}==============================================

// //* route for get all bags by Query Or ALL BAGS => GET (query limit and pages)
// //* GET "/search" → Get bags by query If There OR ALL Bags
// //* Get all bags with optional search query
// publicRoute.get(
// 	'/bags',
// 	searchMiddleware,
// 	paginateMiddleware,
// 	orderByMiddleware,
// 	getAllBagsByQuery
// );

// //* route for get bag by id => GET (params id)
// //* GET "/:bagId" → Get a single bag by ID
// //* Get bag by ID
// publicRoute.get('/bags/:bagId', getBagById);

//*======================================={Bags Public Route}==============================================
