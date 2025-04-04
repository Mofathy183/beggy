//*==========================={User Helpers}========================

export const getDisplayName = (firstName, lastName) => {
	if (!firstName || !lastName) return undefined;

	const titleFirstName =
		firstName.charAt(0).toUpperCase() + firstName.slice(1);
	const titleLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);

	return `${titleFirstName} ${titleLastName}`;
};

export const getAge = (birth) => {
	if (!birth) return null;

	const birthDate = new Date(birth); //* birth already added to the database as new Date
	const currentDate = new Date();
	let age = currentDate.getFullYear() - birthDate.getFullYear();
	const monthDiff = currentDate.getMonth() - birthDate.getMonth();
	const dayDiff = currentDate.getDate() - birthDate.getDate();

	// Adjust age if birth month and day haven't passed yet
	if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
		age--;
	}

	return age;
};
//*==========================={User Helpers}========================

//*==========================={Suitcases and Bags Helpers}========================

export const getCurrentWeight = (items) => {
	if (!items || items.length === 0) return 0;

	const currentWeight = items.reduce((acc, item) => {
		return acc + item.item.weight * item.item.quantity;
	}, 0);

	return Number(parseFloat(currentWeight).toFixed(2));
};

export const getIsWeightExceeded = (items, maxWeight) => {
	if (!maxWeight || !maxWeight) return false;

	const currentWeight = getCurrentWeight(items);

	if (currentWeight) return false;

	//* if the current weight is greater than the max weight
	//* that means the current weight is exceeded the max weight
	//* so return true, else return false
	//* if Exceeded "True", If Not "False"
	return currentWeight > maxWeight;
};

export const getCurrentCapacity = (items) => {
	if (!items || items.length === 0) return 0;

	const currentCapacity = items.reduce((acc, item) => {
		return acc + item.item.volume * item.item.quantity;
	}, 0);

	return Number(parseFloat(currentCapacity).toFixed(2));
};

export const getIsCapacityExceeded = (items, capacity) => {
	if (!capacity || !capacity) return false;

	const currentCapacity = getCurrentCapacity(items);

	if (!currentCapacity) return false;

	//* if the current weight is greater than the max weight
	//* that means the current weight is exceeded the max weight
	//* so return true, else return false
	//* if Exceeded "True", If Not "False"
	return currentCapacity > capacity;
};

//*==========================={Suitcases and Bags Helpers}========================

import crypto from 'crypto';

const COLORS = [
	'#AB47BC',
	'#EC407A',
	'#5C6BC0',
	'#26A69A',
	'#FF7043',
	'#42A5F5',
	'#66BB6A',
	'#FFA726',
	'#8D6E63',
	'#29B6F6',
	'#7E57C2',
	'#D4E157',
];

const getConsistentColor = (email) => {
	const hash = crypto
		.createHash('md5')
		.update(email.trim().toLowerCase())
		.digest('hex');
	const index = parseInt(hash.substring(0, 2), 16) % COLORS.length;
	return COLORS[index];
};

export const setProfilePicture = (firstName, email) => {
	if (!firstName || !email) return undefined;
	const firstLetter = firstName.charAt(0).toUpperCase();
	const bgColor = getConsistentColor(email).substring(1);
	return `https://ui-avatars.com/api/?name=${firstLetter}&background=${bgColor}&color=fff&size=128&bold=true`;
};
