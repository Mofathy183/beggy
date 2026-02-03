/**
 * Read a required public environment variable.
 *
 * This file runs in the browser bundle, so only
 * NEXT_PUBLIC_* vars are allowed here.
 */
const required = (key: `NEXT_PUBLIC_${string}`): string => {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing required environment variable: ${key}`);
	}
	return value;
};

export const env = {
	API_URL: required('NEXT_PUBLIC_API_URL'),
} as const;
