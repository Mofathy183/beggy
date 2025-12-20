import express from 'express';
import {
	VReqToUUID,
	VReqToCreateBag,
	VReqToModifyBag,
} from '../../middlewares/validateRequest.js';
import {
	VReqToCreateSuitcase,
	VReqToModifySuitcase,
	VReqToModifyItem,
	VReqToCreateItem,
} from '../../middlewares/validateRequest.js';
import {
	headersMiddleware,
	checkRoleMiddleware,
	VReqToHeaderToken,
	confirmDeleteMiddleware,
	VReqToConfirmDelete,
	checkPermissionMiddleware,
} from '../../middlewares/authMiddleware.js';
import {
	replaceBagById,
	modifyBagById,
	deleteBagById,
	deleteAllBags,
	replaceSuitcaseById,
	modifySuitcaseById,
	deleteSuitcaseById,
	deleteAllSuitcases,
	replaceItemById,
	modifyItemById,
	deleteItemById,
	deleteAllItems,
} from '../controllers/privateController.js';
import { searchMiddleware } from '../../middlewares/middlewares.js';

const privateRoute = express.Router();

//* Validate request parameters
privateRoute.param('bagId', (req, res, next, bagId) =>
	VReqToUUID(req, res, next, bagId, 'bagId')
);

privateRoute.param('suitcaseId', (req, res, next, suitcaseId) =>
	VReqToUUID(req, res, next, suitcaseId, 'suitcaseId')
);

privateRoute.param('itemId', (req, res, next, itemId) =>
	VReqToUUID(req, res, next, itemId, 'itemId')
);

//*======================================={Bags Private Route}==============================================

//* route for replace (update) bag by id => PUT param(id)
//* PUT /bags/:bagId → Replace an bag (admin/member)
//* Replace (update) an bag by ID
privateRoute.put(
	'/bags/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	checkPermissionMiddleware('update:any', 'bag'),
	VReqToCreateBag,
	replaceBagById
);

//* route for modify (update) bag by id => PATCH param(id)
//* PATCH /bags/:bagId → Modify an bag (admin/member)
//* Modify (update) an bag by ID
privateRoute.patch(
	'/bags/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	checkPermissionMiddleware('update:any', 'bag'),
	VReqToModifyBag,
	modifyBagById
);

//* route for delete All bags => DELETE
//* DELETE /bags → Delete all bags (admin only)
//* Delete all bags (Admin only)
privateRoute.delete(
	'/bags',
	VReqToHeaderToken,
	headersMiddleware,
	searchMiddleware,
	checkRoleMiddleware('admin'),
	checkPermissionMiddleware('delete:any', 'bag'),
	VReqToConfirmDelete,
	confirmDeleteMiddleware,
	deleteAllBags
);

//* route for delete bag by id => DELETE (params id)
//* DELETE /bags/:bagId → Delete an bag (admin/member)
//* Delete an bag by ID
privateRoute.delete(
	'/bags/:bagId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	checkPermissionMiddleware('delete:any', 'bag'),
	deleteBagById
);

//*======================================={Bags Private Route}==============================================

//*======================================={Suitcase Private Route}==============================================

//* route for replace (update) suitcase by id => PUT param(id)
//* PUT /suitcases/:suitcaseId → Replace an suitcase (admin/member)
//* Replace (update) an suitcase by ID
privateRoute.put(
	'/suitcases/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	checkPermissionMiddleware('update:any', 'suitcase'),
	VReqToCreateSuitcase,
	replaceSuitcaseById
);

//* route for modify (update) suitcase by id => PATCH param(id)
//* PATCH /suitcases/:suitcaseId → Modify an suitcase (admin/member)
//* Modify (update) an suitcase by ID
privateRoute.patch(
	'/suitcases/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	checkPermissionMiddleware('update:any', 'suitcase'),
	VReqToModifySuitcase,
	modifySuitcaseById
);

//* route for delete All suitcases By Search or All => DELETE
//* DELETE /suitcases → Delete all suitcases (admin only)
//* Delete all suitcases (Admin only)
privateRoute.delete(
	'/suitcases',
	VReqToHeaderToken,
	headersMiddleware,
	searchMiddleware,
	checkRoleMiddleware('admin'),
	checkPermissionMiddleware('delete:any', 'suitcase'),
	VReqToConfirmDelete,
	confirmDeleteMiddleware,
	deleteAllSuitcases
);

//* route for delete suitcase by id => DELETE (params id)
//* DELETE /suitcases/:suitcaseId → Delete an suitcase (admin/member)
//* Delete an suitcase by ID
privateRoute.delete(
	'/suitcases/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	checkPermissionMiddleware('delete:any', 'suitcase'),
	deleteSuitcaseById
);

//*======================================={Suitcase Private Route}==============================================

//*======================================={Items Private Route}==============================================

//* route for replace (update) item by id => PUT param(id)
//* PUT /items/:itemId → Replace an item (admin/member)
//* Replace (update) an item by ID
privateRoute.put(
	'/items/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	checkPermissionMiddleware('update:any', 'item'),
	VReqToCreateItem,
	replaceItemById
);

//* route for modify (update) item by id => PATCH param(id)
//* PATCH /items/:itemId → Modify an item (admin/member)
//* Modify (update) an item by ID
privateRoute.patch(
	'/items/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	checkPermissionMiddleware('update:any', 'item'),
	VReqToModifyItem,
	modifyItemById
);

//* route for delete All Items By Search or All => DELETE
//* DELETE /items → Delete all items (admin only)
//* Delete all items (Admin only)
privateRoute.delete(
	'/items',
	VReqToHeaderToken,
	headersMiddleware,
	searchMiddleware,
	checkRoleMiddleware('admin'),
	checkPermissionMiddleware('delete:any', 'item'),
	VReqToConfirmDelete,
	confirmDeleteMiddleware,
	deleteAllItems
);

//* route for delete item by id => DELETE (params id)
//* DELETE /items/:itemId → Delete an item (admin/member)
//* Delete an item by ID
privateRoute.delete(
	'/items/:itemId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	checkPermissionMiddleware('delete:any', 'item'),
	deleteItemById
);

//*======================================={Items Private Route}==============================================

export default privateRoute;
