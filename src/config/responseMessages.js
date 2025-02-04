export const errorResponse = {
	badRequest: {
		userDataFailed: 'User Information Not Valid',
		updateFailed: 'User ID Not Valid to Update',
		emailValidFailed: 'Email Not Valid',
		emailNotFound: 'Email Not Found',
		passwordValidFailed:
			'Password Must Be Between 8 and 20 Characters Long And Include At Least One Uppercase Letter, One Lowercase Letter, One Digit, And One Special Character From Them [@$!%*?&]',
		passwordNotFound: 'Password Not Found',
		badRequest: 'Bad Request',
	},

	unauthorized: {
		userAuthFailed: 'User Authentication Required For Delete',
		userRoleAuth: 'Administrator Can Not delete other Administrators',
		unauthorized: 'Unauthorized',
	},
	forbidden: 'Forbidden',

	notFound: {
		uuidValid: 'UUID Not Valid',
		userNotFound: 'User Not Found',
		notFound: 'Not Found',
	},

	conflict: 'Conflict',
	unprocessableEntity: 'Unprocessable Entity',
	internalServerError: 'Internal Server Error',
	serviceUnavailable: 'Service Unavailable',
	badGateway: 'Bad Gateway',
};



export const successResponse = {
    continue: 'Continue',
	processing: 'Processing',
	ok: {
		findAllUsersOk: 'Find All Users Seccesfully',
		findUserByIdOk: 'Find User By ID Seccesfully',
        updateUser: 'Update User Seccesfully',
		ok: 'OK',
	},
	created: {
		createUser: 'User Created Seccesfully',
	},
	noContent: {
		deleteUserById: 'Delete User Seccesfully',
		deleteUsers: 'Delete Users Seccesfully',
		noContent: 'No Content',
	},
}


