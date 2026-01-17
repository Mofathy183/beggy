import dotenv from 'dotenv';
// Load test env FIRST
dotenv.config({ path: '.env.test' });

// Safety guard (optional but recommended)
if (process.env.NODE_ENV !== 'test') {
	throw new Error('Vitest must run with NODE_ENV=test');
}
