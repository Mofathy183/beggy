import { statusStatement } from '../config/status.js';

/**
 * @class 
 */
class SuccessResponse {
	/**
	 * A class to represent a success response from the API.
	 * @param {number} status - The HTTP status code of the response.
	 * @param {string} message - A message to be returned in the response.
	 * @param {Object | Array} data - The data to be returned in the response.
	 * @param {Object} [meta={}] - Additional metadata to be returned in the response.
	 */
	constructor(status, message, data, meta = {}) {
		/**
		 * The HTTP status code of the response.
		 * @type {number}
		 */
		this.status = status;

		/**
		 * A message to be returned in the response.
		 * @type {string}
		 */
		this.message = message;

		/**
		 * The data to be returned in the response.
		 * @type {*}
		 */
		this.data = data;

		/**
		 * Additional metadata to be returned in the response.
		 * @type {Object}
		 */
		this.meta = meta;

		/**
		 * The HTTP status statement of the response.
		 * @type {string}
		 */
		this.statement = statusStatement[this.status];
	}
}

export default SuccessResponse;
