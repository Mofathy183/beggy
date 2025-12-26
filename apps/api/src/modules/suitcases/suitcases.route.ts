import express from 'express';
import {
	VReqToUUID,
	VReqToCreateSuitcase,
	VReqToModifySuitcase,
} from '../../middlewares/validateRequest.js';
import {
	headersMiddleware,
	VReqToHeaderToken,
	confirmDeleteMiddleware,
	VReqToConfirmDelete,
	checkPermissionMiddleware,
} from '../../middlewares/authMiddleware.js';
import {
	paginateMiddleware,
	searchMiddleware,
	orderByMiddleware,
} from '../../middlewares/middlewares.js';
import {
	getSuitcasesBelongsToUser,
	getSuitcaseBelongsToUser,
	createSuitcaseForUser,
	replaceSuitcaseBelongsToUser,
	modifySuitcaseBelongsToUser,
	deleteSuitcaseBelongsToUserById,
	deleteAllSuitcasesBelongsToUser,
} from '../controllers/suitcaseController.js';

//*==================================={suitcases Route For User}===================================
const suitcaseRoute = express.Router();

suitcaseRoute.param('suitcaseId', (req, res, next, suitcaseId) =>
	VReqToUUID(req, res, next, suitcaseId, 'suitcaseId')
);

//* route to get suitcases that user has by Search Optional => GET user must by login
//* GET / → Get all Suitcases for a user
//* Get suitcases that belong to a specific user option query
suitcaseRoute.get(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('read:own', 'suitcase'),
	paginateMiddleware,
	searchMiddleware,
	orderByMiddleware,
	getSuitcasesBelongsToUser
);

//* route to get suitcase that user has by user id => GET (params id) user must by login
//* PUT /:suitcaseId → Replace a user’s suitcase
//* Get suitcases that belong to a specific user
suitcaseRoute.get(
	'/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('read:own', 'suitcase'),
	getSuitcaseBelongsToUser
);

//* route for create suitcase for User => POST (params id) user must by login
//* POST "/" → Create an suitcase for a user
//* Create a single suitcase for a user
suitcaseRoute.post(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('create:own', 'suitcase'),
	VReqToCreateSuitcase,
	createSuitcaseForUser
);

//* route for replace (update) suitcase user has by id of the suitcase => PUT param(id)
//* PUT /:suitcaseId → Replace a user’s suitcase
//* Replace an suitcase that belongs to a user
suitcaseRoute.put(
	'/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('update:own', 'suitcase'),
	VReqToCreateSuitcase,
	replaceSuitcaseBelongsToUser
);

//* route for modify (update) suitcase by id of the suitcase => PATCH param(id)
//* PATCH /:suitcaseId → Modify a user’s suitcase
//* Modify an suitcase that belongs to a user
suitcaseRoute.patch(
	'/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('update:own', 'suitcase'),
	VReqToModifySuitcase,
	modifySuitcaseBelongsToUser
);

//* route for delete all suitcases that user has by user id => DELETE (params id) user must by login
//* DELETE / → Delete all user’s suitcases
//* Delete all suitcases that belong to a user
suitcaseRoute.delete(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('delete:own', 'suitcase'),
	searchMiddleware,
	VReqToConfirmDelete,
	confirmDeleteMiddleware,
	deleteAllSuitcasesBelongsToUser
);

//* route for delete suitcase user has by id of the suitcase => DELETE (params id) user must by login
//* DELETE /:suitcaseId → Delete a user’s suitcase
//* Delete a single suitcase that belongs to a user
suitcaseRoute.delete(
	'/:suitcaseId',
	VReqToHeaderToken,
	headersMiddleware,
	checkPermissionMiddleware('delete:own', 'suitcase'),
	deleteSuitcaseBelongsToUserById
);

export default suitcaseRoute;

//*==================================={suitcases Route For User}===================================

//*======================================={Suitcase Private Route}==============================================

// //* route for replace (update) suitcase by id => PUT param(id)
// //* PUT /suitcases/:suitcaseId → Replace an suitcase (admin/member)
// //* Replace (update) an suitcase by ID
// privateRoute.put(
// 	'/suitcases/:suitcaseId',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin', 'member'),
// 	checkPermissionMiddleware('update:any', 'suitcase'),
// 	VReqToCreateSuitcase,
// 	replaceSuitcaseById
// );

// //* route for modify (update) suitcase by id => PATCH param(id)
// //* PATCH /suitcases/:suitcaseId → Modify an suitcase (admin/member)
// //* Modify (update) an suitcase by ID
// privateRoute.patch(
// 	'/suitcases/:suitcaseId',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin', 'member'),
// 	checkPermissionMiddleware('update:any', 'suitcase'),
// 	VReqToModifySuitcase,
// 	modifySuitcaseById
// );

// //* route for delete All suitcases By Search or All => DELETE
// //* DELETE /suitcases → Delete all suitcases (admin only)
// //* Delete all suitcases (Admin only)
// privateRoute.delete(
// 	'/suitcases',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	searchMiddleware,
// 	checkRoleMiddleware('admin'),
// 	checkPermissionMiddleware('delete:any', 'suitcase'),
// 	VReqToConfirmDelete,
// 	confirmDeleteMiddleware,
// 	deleteAllSuitcases
// );

// //* route for delete suitcase by id => DELETE (params id)
// //* DELETE /suitcases/:suitcaseId → Delete an suitcase (admin/member)
// //* Delete an suitcase by ID
// privateRoute.delete(
// 	'/suitcases/:suitcaseId',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin', 'member'),
// 	checkPermissionMiddleware('delete:any', 'suitcase'),
// 	deleteSuitcaseById
// );

//*======================================={Suitcase Private Route}==============================================

//*======================================={Suitcase Public Route}==============================================

// //* route for get all suitcases by Query => GET (query limit and pages)
// //* GET "/search" → Get suitcases by query
// //* Get all suitcases with optional search query
// publicRoute.get(
// 	'/suitcases',
// 	searchMiddleware,
// 	paginateMiddleware,
// 	orderByMiddleware,
// 	getAllSuitcasesByQuery
// );

// //* route for get suitcase by id => GET (params id)
// //* GET "/:suitcaseId" → Get a single suitcase by ID
// //* Get suitcase by ID
// publicRoute.get('/suitcases/:suitcaseId', getSuitcaseById);

//*======================================={Suitcase Public Route}==============================================
