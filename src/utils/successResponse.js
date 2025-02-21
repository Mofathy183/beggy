import { statusStatment } from '../config/status.js';

class SuccessResponse {
	constructor(status, message, data, meta = undefined) {
		this.status = status;
		this.message = message;
		this.data = data;
		this.statment = statusStatment[this.status];
		//* to check if the data comes from delete request
		this.isNumber = typeof data === 'number';
		this.meta = meta;
	}
}

//* for how it will display the the user if find user or users or create a new user
const successfullyForUser = (data, message, status) => {
	return {
		success: true,
		status: status,
		message: message,
		data: data,
	};
};

export default SuccessResponse;
