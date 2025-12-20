// export const statusCode = {
// 	continueCode: 100,
// 	processingCode: 102,
// 	okCode: 200,
// 	createdCode: 201,
// 	noContentCode: 204,
// 	badRequestCode: 400,
// 	unauthorizedCode: 401,
// 	forbiddenCode: 403,
// 	notFoundCode: 404,
// 	conflictCode: 409,
// 	unprocessableEntityCode: 422,
// 	tooManyRequestsCode: 429,
// 	internalServerErrorCode: 500,
// 	serviceUnavailableCode: 503,
// 	badGatewayCode: 504,
// };

// export const statusStatement = {
// 	100: 'Continue',
// 	102: 'Processing',
// 	200: 'OK',
// 	201: 'Created',
// 	400: 'Bad Request',
// 	401: 'Unauthorized',
// 	403: 'Forbidden',
// 	404: 'Not Found',
// 	409: 'Conflict',
// 	422: 'Unprocessable Entity',
// 	429: 'Too Many Requests',
// 	500: 'Internal Server Error',
// 	503: 'Service Unavailable',
// 	504: 'Gateway Timeout',
// };

export const STATUS_CODE = {
	CONTINUE: 100, // for large data uploads
	PROCESSING: 102, //for async possesses
	OK: 200,
	CREATED: 201, //for success in create a new user
	NO_CONTENT: 204, //the request success but there is no content to return
	BAD_REQUEST: 400, // for invalid syntax of missing parameters like username and password and email
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404, //for endpoint like id
	CONFLICT: 409,
	UNPROCESSABLE: 422,
	TOO_MANY_REQUESTS: 429,
	INTERNAL_ERROR: 500,
	SERVICE_UNAVAILABLE: 503,
	BAD_GATEWAY: 504,
} as const;

export type StatusCode = (typeof STATUS_CODE)[keyof typeof STATUS_CODE];

export const STATUS_MESSAGE: Record<StatusCode, string> = {
	100: 'Continue',
	102: 'Processing',
	200: 'OK',
	201: 'Created',
	204: 'No Content',
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
