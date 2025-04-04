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
