import express from 'express';
import {
	createUser,
	findUserById,
	findUserPublicProfile,
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
} from '../../middlewares/authMiddleware.js';
import {
	paginateMiddleware,
	orderByMiddleware,
	searchMiddleware,
	searchForUsersMiddleware,
} from '../../middlewares/middlewares.js';

const userRoute = express.Router();

//* to check if the id in params is valid and exists
userRoute.param('id', (req, res, next, id) =>
	VReqToUUID(req, res, next, id, 'id')
);

//*========================{Public Route}========================
//* route to get user public profile by id => GET param (id)
userRoute.get('/:id/public', findUserPublicProfile);

//* route for search for users by query => GET
userRoute.get(
	'/search',
	paginateMiddleware,
	searchForUsersMiddleware,
	findAllUsers
);
//*========================{Public Route}========================

//*========================{Private Route}========================

//* route for get user private profile by id => GET param (id)
userRoute.get(
	'/:id/private',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	findUserById
);

//* route for get all users => GET (Only Admin)
userRoute.get(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	paginateMiddleware,
	orderByMiddleware,
	searchForUsersMiddleware,
	findAllUsers
);

//* route for create user => POST (only Admin)
userRoute.post(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin'),
	VReqToCreateUser,
	createUser
);

//* route for change user role => PATCH (Admin and Member only)
userRoute.patch(
	'/:id/role',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin'),
	VReqToUserRole,
	changeUserRoleById
);

//* route for delete user by id => DELETE param(id) //delete
userRoute.delete(
	'/:id',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin', 'member'),
	deleteUserById
);

//* route for delete all users => DELETE  //delete
userRoute.delete(
	'/',
	VReqToHeaderToken,
	headersMiddleware,
	checkRoleMiddleware('admin'),
	confirmDeleteMiddleware,
	deleteAllUsers
);

//*========================{Private Route}========================
export default userRoute;
