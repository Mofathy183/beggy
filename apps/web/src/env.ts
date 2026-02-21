/**
 * Read a required public environment variable.
 *
 * This file runs in the browser bundle, so only
 * NEXT_PUBLIC_* vars are allowed here.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
	throw new Error(
		'Missing required environment variable: NEXT_PUBLIC_API_URL'
	);
}

export const env = {
	API_URL,
} as const;
