import express from 'express';
import {
	createUser,
	findUserById,
	findAllUsers,
	changeUserRoleById,
	deleteUserById,
	deleteAllUsers,
} from '../controllers/userController.js';
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

const userRoute = express.Router();

//* to check if the id in params is valid and exists
userRoute.param('id', (req, res, next, id) =>
	VReqToUUID(req, res, next, id, 'id')
);

//* route for get all users => GET (Only Admin)
userRoute.get(
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
userRoute.get(
	'/:id',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	checkPermissionMiddleware('read:any', 'user'),
	findUserById
);

//* route for create user => POST (only Admin)
userRoute.post(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin'),
	checkPermissionMiddleware('create:any', 'user'),
	VReqToCreateUser,
	createUser
);

//* route for change user role => PATCH (Admin and Member only)
userRoute.patch(
	'/:id/role',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin'),
	checkPermissionMiddleware('update:any', 'user'),
	VReqToUserRole,
	changeUserRoleById
);

//* route for delete all users => DELETE  //delete
userRoute.delete(
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
userRoute.delete(
	'/:id',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin'),
	checkPermissionMiddleware('delete:any', 'user'),
	deleteUserById
);

export default userRoute;
