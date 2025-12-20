//* USERS: "Manage your profile"
//* router.get('/users/me', requireAuth, usersController.getMe);
//* router.patch('/users/me', requireAuth, validate(updateProfileSchema), usersController.updateProfile);
//* router.patch('/users/me/password', requireAuth, validate(changePasswordSchema), usersController.changePassword);
//* router.patch('/users/me/email', requireAuth, validate(changeEmailSchema), usersController.changeEmail);
//* router.delete('/users/me', requireAuth, usersController.deactivateAccount);
//* router.get('/users/me/permissions', requireAuth, usersController.getPermissions);
//* router.post('/users/me/send-verification-email', requireAuth, usersController.sendVerificationEmail);

//* // Public user profiles
//* router.get('/users', usersController.getPublicUsers);
//* router.get('/users/:id', usersController.getUserPublicProfile);

//* // Admin endpoints
//* router.get('/admin/users', requireAuth, requireAdmin, usersController.getAllUsers);
//* // ... other admin endpoints


//*==============================================={{ USER ME ROUTES }}=====================================================

// //* for get user permissions => GET
// //* user must be login already to get his permissions
// authRoute.get(
// 	'/permissions',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	permissions
// );


// //* route for frontend to check if user is authentic
// authRoute.get('/me', VReqToHeaderToken, headersMiddleware, authMe);

// //* route for send verification email
// //* POST {email}
// authRoute.post(
// 	'/send-verification-email',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	VReqToEmail,
// 	sendVerificationEmail
// );

// //* route for changing password (only for logged-in users) => PATCH
// //   Requires: currentPassword, newPassword, confirmPassword
// authRoute.patch(
// 	'/change-password',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkPermissionMiddleware('update:own', 'user'),
// 	VReqToUpdatePassword,
// 	updatePassword
// );

// //* route for editing profile info (excluding password) => PATCH
// authRoute.patch(
// 	'/edit-profile',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	VReqToUpdateUserData,
// 	checkPermissionMiddleware('update:own', 'user'),
// 	updateData
// );

// //* route for change user email => PATCH (email) user must by login to change his email
// authRoute.patch(
// 	'/change-email',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	VReqToEmail,
// 	changeEmail
// );

// //* route for deactivate user account => DELETE  (User must be login already to be deactivated)
// authRoute.delete(
// 	'/deactivate',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkPermissionMiddleware('delete:own', 'user'),
// 	deActivate
// );

//*==============================================={{ USER ME ROUTES }}=====================================================



//*==============================================={{ ADMIN ROUTES }}=====================================================
// const adminRoute = express.Router();

// //* to check if the id in params is valid and exists
// adminRoute.param('id', (req, res, next, id) =>
// 	VReqToUUID(req, res, next, id, 'id')
// );

// //* route for get all users => GET (Only Admin)
// adminRoute.get(
// 	'/',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin', 'member'),
// 	checkPermissionMiddleware('read:any', 'user'),
// 	paginateMiddleware,
// 	orderByMiddleware,
// 	searchForUsersMiddleware,
// 	findAllUsers
// );

// //* route for get user private profile by id => GET param (id)
// adminRoute.get(
// 	'/:id',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin', 'member'),
// 	checkPermissionMiddleware('read:any', 'user'),
// 	findUserById
// );

// //* route for create user => POST (only Admin)
// adminRoute.post(
// 	'/',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin'),
// 	checkPermissionMiddleware('create:any', 'user'),
// 	VReqToCreateUser,
// 	createUser
// );

// //* route for change user role => PATCH (Admin and Member only)
// adminRoute.patch(
// 	'/:id/role',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin'),
// 	checkPermissionMiddleware('update:any', 'user'),
// 	VReqToUserRole,
// 	changeUserRoleById
// );

// //* route for delete all users => DELETE  //delete
// adminRoute.delete(
// 	'/',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin'),
// 	checkPermissionMiddleware('delete:any', 'user'),
// 	searchForUsersMiddleware,
// 	VReqToConfirmDelete,
// 	confirmDeleteMiddleware,
// 	deleteAllUsers
// );

// //* route for delete user by id => DELETE param(id) //delete
// adminRoute.delete(
// 	'/:id',
// 	VReqToHeaderToken,
// 	headersMiddleware,
// 	checkRoleMiddleware('admin'),
// 	checkPermissionMiddleware('delete:any', 'user'),
// 	deleteUserById
// );

//*==============================================={{ ADMIN ROUTES }}=====================================================




//*======================================={Users Public Route}==============================================

// //* route for search for users by query => GET
// publicRoute.get(
// 	'/users',
// 	paginateMiddleware,
// 	orderByMiddleware,
// 	searchForUsersMiddleware,
// 	getAllUsers
// );

// //* route to get user public profile by id => GET param (id)
// publicRoute.get('/users/:id', getUserPublicProfile);

//*======================================={Users Public Route}==============================================