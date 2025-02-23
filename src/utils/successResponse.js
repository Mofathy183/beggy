import { statusStatment } from '../config/status.js';

class SuccessResponse {
	constructor(status, message, data, meta = undefined) {
        this.status = status;
		this.statment = statusStatment[this.status];
		//* to check if the data comes from delete request
		this.isNumber = typeof data === 'number';
        this.isEmity = data === null;
		this.data = this.isNumber ? {deleteCount: data} : data;
        this.message = this.isEmity ? "There is no Data" : message;
		this.meta = meta;
	}
}

export default SuccessResponse;
