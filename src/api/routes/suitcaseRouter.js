import express from 'express';
import {
	VReqToUUID,
	VReqToCreateSuitcase,
	VReqToModifySuitcase,
    VReqToBodyItemId,
    VReqToBodyItemsIds
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
	//*====={suitcases User Router}=========
	getAllSuitcasesByQuery,
	getSuitcaseById,
	replaceSuitcaseById,
	modifySuitcaseById,
	deleteSuitcaseById,
	deleteAllSuitcases,
	//*====={suitcases User Router}=========
	//*====={suitcases Router}=========
	getSuitcasesBelongsToUser,
	getSuitcaseBelongsToUser,
	createSuitcaseForUser,
	replaceSuitcaseBelongsToUser,
	modifySuitcaseBelongsToUser,
	deleteSuitcaseBelongsToUserById,
	deleteAllSuitcasesBelongsToUser,
    createItemForUserSuitcase,
    createItemsForUserSuitcase
	//*====={suitcases Router}=========
} from '../controllers/suitcaseController.js';

const suitcaseRoute = express.Router();

//* Validate request parameters
suitcaseRoute.param('id', (req, res, next, id) =>
	VReqToUUID(req, res, next, id, 'id')
);

suitcaseRoute.param('suitcaseId', (req, res, next, suitcaseId) =>
	VReqToUUID(req, res, next, suitcaseId, 'suitcaseId')
);

//*=========================================={Base suitcases Route}===================================

//* route for get All suitcases => GET
//* GET "/" → Get all suitcases
suitcaseRoute.get(
	'/',
	paginateMiddleware,
	orderByMiddleware,
	getAllSuitcasesByQuery
);

//* route for get suitcase by id => GET (params id)
//* GET "/:suitcaseId" → Get a single suitcase by ID
//* Get suitcase by ID
suitcaseRoute.get('/:suitcaseId', getSuitcaseById);

//* route for get all suitcases by Querys => GET (query limit and pages)
//* GET "/search" → Get suitcases by query
//* Get all suitcases with optional search query
suitcaseRoute.get(
	'/search',
	searchMiddleware,
	paginateMiddleware,
	orderByMiddleware,
	getAllSuitcasesByQuery
);

//* route for replace (update) suitcase by id => PUT param(id)
//* PUT /:suitcaseId → Replace an suitcase (admin/member)
//* Replace (update) an suitcase by ID
suitcaseRoute.put(
	'/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	VReqToCreateSuitcase,
	replaceSuitcaseById
);

//* route for modify (update) suitcase by id => PATCH param(id)
//* PATCH /:suitcaseId → Modify an suitcase (admin/member)
//* Modify (update) an suitcase by ID
suitcaseRoute.patch(
	'/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	VReqToModifySuitcase,
	modifySuitcaseById
);

//* route for delete suitcase by id => DELETE (params id)
//* DELETE /:suitcaseId → Delete an suitcase (admin/member)
//* Delete an suitcase by ID
suitcaseRoute.delete(
	'/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	deleteSuitcaseById
);

//* route for delete All suitcases => DELETE
//* DELETE /delete-all → Delete all suitcases (admin only)
//* Delete all suitcases (Admin only)
suitcaseRoute.delete(
	'/delete-all',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin'),
	confirmDeleteMiddleware,
	deleteAllSuitcases
);

//*=========================================={Base suitcases Route}===================================

//*=========================================={suitcases Route For User}===================================

//* route to get suitcases that user has by user => GET user muet by login
//* GET /user → Get all suitcases for a user
//* Get suitcases that belong to a specific user option query
suitcaseRoute.get(
	'/user',
	VReqToHeaderToken,
	headersMiddleware,
	paginateMiddleware,
	searchMiddleware,
	orderByMiddleware,
	getSuitcasesBelongsToUser
);

//* route to get suitcase that user has by user id => GET (params id) user muet by login
//* PUT /user/:suitcaseId → Replace a user’s suitcase
//* Get suitcases that belong to a specific user
suitcaseRoute.get(
	'/user/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	getSuitcaseBelongsToUser
);

//* route for create suitcase for User => POST (params id) user muet by login
//* POST "/user" → Create an suitcase for a user
//* Create a single suitcase for a user
suitcaseRoute.post(
	'/user',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToCreateSuitcase,
	createSuitcaseForUser
);

//* route for create item for User suitcase => POST (body itemId) (params id) user muet by login
//* POST "/user/item/:suitcaseId" → Create an item for user suitcase
//* Create a single item for a user suitcase
suitcaseRoute.post(
    '/user/item/:suitcaseId',
    VReqToHeaderToken,
    headersMiddleware,
    VReqToBodyItemId,
    createItemForUserSuitcase
);

//* route for create items for User suitcase => POST (params id) user muet by login
//* POST "/user/items/:suitcaseId" → Create multiple items for a user suitcase
//* Create multiple items for a user suitcase
suitcaseRoute.post(
    '/user/items/:suitcaseId',
    VReqToHeaderToken,
    headersMiddleware,
    VReqToBodyItemsIds,
    createItemsForUserSuitcase
);

//* route for replace (update) suitcase user has by id of the suitcase => PUT param(id)
//* PUT /user/:suitcaseId → Replace a user’s suitcase
//* Replace an suitcase that belongs to a user
suitcaseRoute.put(
	'/user/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToCreateSuitcase,
	replaceSuitcaseBelongsToUser
);

//* route for modify (update) suitcase by id of the suitcase => PATCH param(id)
//* PATCH /user/:suitcaseId → Modify a user’s suitcase
//* Modify an suitcase that belongs to a user
suitcaseRoute.patch(
	'/user/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	VReqToModifySuitcase,
	modifySuitcaseBelongsToUser
);

//* route for delete suitcase user has by id of the suitcase => DELETE (params id) user muet by login
//* DELETE /user/:suitcaseId → Delete a user’s suitcase
//* Delete a single suitcase that belongs to a user
suitcaseRoute.delete(
	'user/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	deleteSuitcaseBelongsToUserById
);

//* route for delete all suitcases that user has by user id => DELETE (params id) user muet by login
//* DELETE /user/all → Delete all user’s suitcases
//* Delete all suitcases that belong to a user
suitcaseRoute.delete(
	'/user/all',
	VReqToHeaderToken,
	headersMiddleware,
	deleteAllSuitcasesBelongsToUser
);

//*=========================================={suitcases Route For User}===================================

export default suitcaseRoute;
