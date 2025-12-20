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