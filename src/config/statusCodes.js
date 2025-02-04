

export const statusCode = {
	continueCode: 100, // for large data uploads
	processingCode: 102, //for async prossesses
	okCode: 200,
	createdCode: 201, //for secces in create a new user
	noContentCode: 204, //the request seccess but there is no content to return
	badRequestCode: 400, // for invaild syntax of missing parameters like username and password and email
	unauthorizedCode: 401,
	forbiddenCode: 403,
	notFoundCode: 404, //for endpoint like id
	conflictCode: 409,
	unprocessableEntityCode: 422,
	//Code tooManyRequests: 429,
	internalServerErrorCode: 500,
	serviceUnavailableCode: 503,
	badGatewayCode: 504,
};