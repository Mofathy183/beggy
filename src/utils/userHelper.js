//* this will add to the database because birth is DateTime
export const birthOfDate = (birth) => {
	if (!birth) return undefined;

	return new Date(birth);
};

//* this will add to the database because profile picture has default value
//* will add if user does not have profile picture
//* means that is value is undefined

export const haveProfilePicture = (profilePicture) => {
	if (!profilePicture) return undefined;

	return profilePicture;
};

//*=============================={Password Change}============================

//* this will add to the database because to handle the password change at feild
export const passwordChangeAt = () => {
	const changeAt = new Date(Date.now());
	return changeAt;
};

//* to store the password reset token expiration date
export const resetPasswordExpiredAt = () => {
	const expiredAt = new Date(Date.now() + 10 * 60 * 1000);
	return expiredAt;
};

//* for conmpart it with the timestamp in token
//* to make sure that the user has not change has password after issued the token
//* (if it before issued the token that means that the user has not change has password)
export const passwordChangeTimestamp = (changeAt) => {
	const timestamp = parseInt(changeAt.getTime() / 1000, 10);
	return timestamp;
};

export const passwordChangeAfter = (user, tokenTiemstamp) => {
	//? if the user has changed password
	//* that means the user has changed password
	if (user.passwordChangeAt) {
		const passwordTiemstamp = passwordChangeTimestamp(
			user.passwordChangeAt
		);

		//? if the user has changed password after issued the token
		//* return true the user has changed password after issued the token
		//? else
		//* return false the user has not changed password
		return passwordTiemstamp > tokenTiemstamp;
	}

	//? if the user has not changed has password
	//* return false
	return false;
};
