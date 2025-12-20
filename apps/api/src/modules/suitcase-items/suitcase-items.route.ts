import express from 'express';
import {
	VReqToUUID,
	VReqToBodyItemId,
	VReqToBodyItemsIds,
	VReqToBodyItemsIdsForDelete,
} from '../../middlewares/validateRequest.js';
import {
	headersMiddleware,
	VReqToHeaderToken,
	confirmDeleteMiddleware,
	VReqToConfirmDelete,
	checkPermissionMiddleware,
} from '../../middlewares/authMiddleware.js';
import { searchMiddleware } from '../../middlewares/middlewares.js';
import {
	deleteItemFromUserSuitcase,
	deleteItemsFromUserSuitcase,
	deleteAllItemsFromUserSuitcase,
	createItemForUserSuitcase,
	createItemsForUserSuitcase,
} from '../controllers/suitcaseItemsController.js';

const suitcaseItemsRoute = express.Router();

//* Validate request parameters
suitcaseItemsRoute.param('suitcaseId', (req, res, next, suitcaseId) =>
	VReqToUUID(req, res, next, suitcaseId, 'suitcaseId')
);

//* route for create item for User suitcase => POST (body itemId) (params id) user must by login
//* POST "/:suitcaseId/item" → Create an item for user suitcase
//* Create a single item for a user suitcase
suitcaseItemsRoute.post(
	'/:suitcaseId/item',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('create:own', 'item'),
	VReqToBodyItemId,
	createItemForUserSuitcase
);

//* route for create items for User suitcase => POST (params id) user must by login
//* POST "/:suitcaseId/items" → Create multiple items for a user suitcase
//* Create multiple items for a user suitcase
suitcaseItemsRoute.post(
	'/:suitcaseId/items',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('create:own', 'item'),
	VReqToBodyItemsIds,
	createItemsForUserSuitcase
);

//* route for delete Item From suitcase that user has => DELETE (itemId in Body & params id) user must by login
//* DELETE /:suitcaseId/item → Delete an Item From user’s suitcase
//* Delete Item From suitcase that belong to a user
suitcaseItemsRoute.delete(
	'/:suitcaseId/item',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('delete:own', 'item'),
	VReqToBodyItemId,
	deleteItemFromUserSuitcase
);

//* route for delete Items From suitcase that user has => DELETE (itemsIds in Body & params id) user must by login
//* DELETE /:suitcaseId/items → Delete Items From user’s suitcase
//* Delete Items From suitcase that belong to a user
suitcaseItemsRoute.delete(
	'/:suitcaseId/items',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('delete:own', 'item'),
	VReqToBodyItemsIdsForDelete,
	confirmDeleteMiddleware,
	deleteItemsFromUserSuitcase
);

//* route for delete All Items From suitcase that user has => DELETE (params id) user must by login
//* DELETE /:suitcaseId/items/bulk → Delete All Items From user’s suitcase
//* Delete All Items From suitcase that belong to a user
suitcaseItemsRoute.delete(
	'/:suitcaseId/items/bulk',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('delete:own', 'item'),
	searchMiddleware,
	VReqToConfirmDelete,
	confirmDeleteMiddleware,
	deleteAllItemsFromUserSuitcase
);

export default suitcaseItemsRoute;
