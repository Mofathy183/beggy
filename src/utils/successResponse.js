import { statusStatement } from '../config/status.js';

class SuccessResponse {
	constructor(status, message, data, meta = undefined) {
		this.status = status;
		this.statement = statusStatement[this.status];
		this.data = data;
		this.message = message;
		this.meta = meta;
	}
}

export default SuccessResponse;
