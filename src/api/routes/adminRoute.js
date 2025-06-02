import express from 'express';
import {
	createUser,
	findUserById,
	findAllUsers,
	changeUserRoleById,
	deleteUserById,
	deleteAllUsers,
} from '../controllers/adminController.js';
import {
	VReqToUUID,
	VReqToCreateUser,
	VReqToUserRole,
} from '../../middlewares/validateRequest.js';
import {
	headersMiddleware,
	checkRoleMiddleware,
	confirmDeleteMiddleware,
	VReqToHeaderToken,
	checkPermissionMiddleware,
	VReqToConfirmDelete,
} from '../../middlewares/authMiddleware.js';
import {
	paginateMiddleware,
	orderByMiddleware,
	searchForUsersMiddleware,
} from '../../middlewares/middlewares.js';

const adminRoute = express.Router();

//* to check if the id in params is valid and exists
adminRoute.param('id', (req, res, next, id) =>
	VReqToUUID(req, res, next, id, 'id')
);

//* route for get all users => GET (Only Admin)
adminRoute.get(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	checkPermissionMiddleware('read:any', 'user'),
	paginateMiddleware,
	orderByMiddleware,
	searchForUsersMiddleware,
	findAllUsers
);

//* route for get user private profile by id => GET param (id)
adminRoute.get(
	'/:id',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	checkPermissionMiddleware('read:any', 'user'),
	findUserById
);

//* route for create user => POST (only Admin)
adminRoute.post(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin'),
	checkPermissionMiddleware('create:any', 'user'),
	VReqToCreateUser,
	createUser
);

//* route for change user role => PATCH (Admin and Member only)
adminRoute.patch(
	'/:id/role',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin'),
	checkPermissionMiddleware('update:any', 'user'),
	VReqToUserRole,
	changeUserRoleById
);

//* route for delete all users => DELETE  //delete
adminRoute.delete(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin'),
	checkPermissionMiddleware('delete:any', 'user'),
	searchForUsersMiddleware,
	VReqToConfirmDelete,
	confirmDeleteMiddleware,
	deleteAllUsers
);

//* route for delete user by id => DELETE param(id) //delete
adminRoute.delete(
	'/:id',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin'),
	checkPermissionMiddleware('delete:any', 'user'),
	deleteUserById
);

export default adminRoute;
