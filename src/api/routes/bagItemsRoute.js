import express from "express";
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
} from '../../middlewares/authMiddleware.js';
import { searchMiddleware } from "../../middlewares/middlewares.js"
import {
    createItemForUserBag,
	createItemsForUserBag,
    deleteItemsFromUserBag,
	deleteItemFromUserBag,
	deleteAllItemsFromUserBag,
} from "../controllers/bagItemsController.js"


const bagItemsRoute = express.Router();


//* Validate request parameters
bagItemsRoute.param('bagId', (req, res, next, bagId) =>
    VReqToUUID(req, res, next, bagId, 'bagId')
);

//* route for create item for User Bag => POST (body itemId) (params id) user muet by login
//* POST '/:bagId/item' → Create an item for user Bag
//* Create a single item for a user Bag
bagItemsRoute.post(
    '/:bagId/item',
    VReqToHeaderToken,
    headersMiddleware,
    VReqToBodyItemId,
    createItemForUserBag
);

//* route for create items for User Bag => POST (params id) user muet by login
//* POST '/:bagId/items' → Create multiple items for a user Bag
//* Create multiple items for a user Bag
bagItemsRoute.post(
    '/:bagId/items',
    VReqToHeaderToken,
    headersMiddleware,
    VReqToBodyItemsIds,
    createItemsForUserBag
);

//* route for delete Item By its Id From User's Bag => DELETE (params id) user muet by login
//* DELETE '/:bagId/item' → Delete Item By its Id From User's Bag
//* Delete Item By its Id From User's Bag
bagItemsRoute.delete(
    '/:bagId/item',
    VReqToHeaderToken,
    headersMiddleware,
    VReqToBodyItemId,
    deleteItemFromUserBag
);

//* route for delete Items By They Ids From User's Bag => DELETE (params id) user muet by login
//* DELETE '/:bagId/items' → Delete Items By They Ids From User's Bag
//* Delete Items By They Ids From User's Bag
bagItemsRoute.delete(
    '/:bagId/items',
    VReqToHeaderToken,
    headersMiddleware,
    VReqToBodyItemsIdsForDelete,
    deleteItemsFromUserBag
);

//* route for delete All Items From User's Bag => DELETE (params id) user muet by login
//* DELETE '/:bagId/items/bulk' → Delete All Item From User's Bag
//* Delete All Item From User's Bag
bagItemsRoute.delete(
    '/:bagId/items/bulk',
    VReqToHeaderToken,
    headersMiddleware,
    searchMiddleware,
    VReqToConfirmDelete,
    confirmDeleteMiddleware,
    deleteAllItemsFromUserBag
);



export default bagItemsRoute;