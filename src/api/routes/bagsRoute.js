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

export default bagsRoute;
