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