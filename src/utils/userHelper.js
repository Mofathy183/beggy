import { addMinutes } from "date-fns"

/**
 * @description this will add to the database because birth is DateTime
 * @param {String} birth 
 * @example birthOfDate("2005-12-12")// 2005-12-12T00:00:00.000Z
 * @returns {Date} new Date Object of the string Date
 */
export const birthOfDate = (birth) => {
	if (!birth) return undefined;

	return new Date(birth);
};

/**
 * @description this will add to the database because profile picture has default value
 * will add if user does not have profile picture
 * means that is value is undefined
 * 
 * @param {String} profilePicture 
 * @returns {String | undefined} if profilePicture exists will return it, if not will return undefined
 */
export const haveProfilePicture = (profilePicture) => {
	if (!profilePicture) return undefined;

	return profilePicture;
};

/**
 * @description to store the email token expires at data, 
 * to store the password reset token expiration date
 * @param {String} type - Either 'email' or 'password'.
 * "email" returns expires in 1 hour, 
 * "password" returns expires in 10 minutes.
 * @returns {Date}
 */
export const setExpiredAt = (type) => {
    //* the email token will expires in 1 hour
    if(type === "email") return addMinutes(new Date(), 10);

    //* the password token will expires in 10 minutes
	return addMinutes(new Date(), 60);
};

//*=============================={Password Change}============================

/**
 * @description this will add to the database because to handle the password change at felid
 * @returns {Date}
 */
export const passwordChangeAt = () => {
	const changeAt = new Date();
	return changeAt;
};

/**
 * @description for compare it with the timestamp in token
 * to make sure that the user has not change has password after issued the token
 * (if it before issued the token that means that the user has not change has password)
 * 
 * @param {Date} changeAt 
 * @returns {Number} Timestamp
 */
const passwordChangeTimestamp = (changeAt) => {
	const timestamp = parseInt(changeAt.getTime() / 1000, 10);
	return timestamp;
};

/**
 * @description Check if user password change
 * by check if the password change at timestamp
 * and compare it with the timestamp in token
 * 
 * @param {Date} passwordChangeAt - will convert it to timestamp
 * @param {Number} tokenTimestamp - that is a timestamp from the token
 * @returns {Boolean} the result of compare passwordChangeAt timestamp and tokenTimestamp
 */
export const passwordChangeAfter = (passwordChangeAt, tokenTimestamp) => {
	//? if the user has changed password
	//* that means the user has changed password
	if (passwordChangeAt) {
		const passwordTimestamp = passwordChangeTimestamp(passwordChangeAt);

		//? if the user has changed password after issued the token
		//* return true the user has changed password after issued the token
		//? else
		//* return false the user has not changed password
		return passwordTimestamp > tokenTimestamp;
	}

	//? if the user has not changed has password
	//* return false
	return false;
};
