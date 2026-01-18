import { describe, it, expect, vi, beforeEach } from 'vitest';

import { hashPassword, verifyPassword } from '@shared/utils';
import { ErrorCode } from '@beggy/shared/constants';

vi.mock('bcrypt', () => ({
	genSalt: vi.fn(),
	hash: vi.fn(),
	compare: vi.fn(),
}));

import { genSalt, hash, compare } from 'bcrypt';

describe('hashPassword()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns a hashed password', async () => {
		(genSalt as any).mockResolvedValue('salt');
		(hash as any).mockResolvedValue('hashed-password');

		const result = await hashPassword('plain-password');

		expect(genSalt).toHaveBeenCalledWith(10);
		expect(hash).toHaveBeenCalledWith('plain-password', 'salt');
		expect(result).toBe('hashed-password');
	});

	it('throws server error when hashing fails', async () => {
		const error = new Error('bcrypt failed');

		(genSalt as any).mockRejectedValue(error);

		await expect(hashPassword('plain-password')).rejects.toMatchObject({
			code: ErrorCode.PASSWORD_HASH_FAILED,
		});
	});
});

describe('verifyPassword()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns false when hashed password is missing', async () => {
		const result = await verifyPassword('plain-password', '');

		expect(result).toBe(false);
		expect(compare).not.toHaveBeenCalled();
	});

	it('returns true when passwords match', async () => {
		(compare as any).mockResolvedValue(true);

		const result = await verifyPassword(
			'plain-password',
			'hashed-password'
		);

		expect(compare).toHaveBeenCalledWith(
			'plain-password',
			'hashed-password'
		);
		expect(result).toBe(true);
	});

	it('returns false when passwords do not match', async () => {
		(compare as any).mockResolvedValue(false);

		const result = await verifyPassword(
			'plain-password',
			'hashed-password'
		);

		expect(result).toBe(false);
	});

	it('throws server error when verification fails', async () => {
		const error = new Error('bcrypt compare failed');

		(compare as any).mockRejectedValue(error);

		await expect(
			verifyPassword('plain-password', 'hashed')
		).rejects.toMatchObject({
			code: ErrorCode.PASSWORD_VERIFY_FAILED,
		});
	});
});
