export const statusCode = {
	continueCode: 100, // for large data uploads
	processingCode: 102, //for async possesses
	okCode: 200,
	createdCode: 201, //for success in create a new user
	noContentCode: 204, //the request success but there is no content to return
	badRequestCode: 400, // for invalid syntax of missing parameters like username and password and email
	unauthorizedCode: 401,
	forbiddenCode: 403,
	notFoundCode: 404, //for endpoint like id
	conflictCode: 409,
	unprocessableEntityCode: 422,
	tooManyRequestsCode: 429,
	internalServerErrorCode: 500,
	serviceUnavailableCode: 503,
	badGatewayCode: 504,
};

export const statusStatement = {
	100: 'Continue',
	102: 'Processing',
	200: 'OK',
	201: 'Created',
	400: 'Bad Request',
	401: 'Unauthorized',
	403: 'Forbidden',
	404: 'Not Found',
	409: 'Conflict',
	422: 'Unprocessable Entity',
	429: 'Too Many Requests',
	500: 'Internal Server Error',
	503: 'Service Unavailable',
	504: 'Gateway Timeout',
};
