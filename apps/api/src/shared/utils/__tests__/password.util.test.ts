import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashPassword, verifyPassword } from '@shared/utils';
import { ErrorCode } from '@beggy/shared/constants';

import { hash, compare } from 'bcryptjs';

vi.mock('bcryptjs', () => ({
	hash: vi.fn(),
	compare: vi.fn(),
}));

describe('hashPassword()', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns a hashed password', async () => {
		// Arrange
		(hash as any).mockResolvedValue('hashed-password');

		// Act
		const result = await hashPassword('plain-password');

		// Assert
		expect(hash).toHaveBeenCalledWith('plain-password', expect.any(Number));
		expect(result).toBe('hashed-password');
	});

	it('throws when hashing fails', async () => {
		// Arrange
		const error = new Error('bcrypt failed');
		(hash as any).mockRejectedValue(error);

		// Act + Assert
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
		// Act
		const result = await verifyPassword('plain-password', '');

		// Assert
		expect(result).toBe(false);
		expect(compare).not.toHaveBeenCalled();
	});

	it('returns true when passwords match', async () => {
		// Arrange
		(compare as any).mockResolvedValue(true);

		// Act
		const result = await verifyPassword(
			'plain-password',
			'hashed-password'
		);

		// Assert
		expect(compare).toHaveBeenCalledWith(
			'plain-password',
			'hashed-password'
		);
		expect(result).toBe(true);
	});

	it('returns false when passwords do not match', async () => {
		// Arrange
		(compare as any).mockResolvedValue(false);

		// Act
		const result = await verifyPassword(
			'plain-password',
			'hashed-password'
		);

		// Assert
		expect(result).toBe(false);
	});

	it('throws when verification fails', async () => {
		// Arrange
		const error = new Error('compare failed');
		(compare as any).mockRejectedValue(error);

		// Act + Assert
		await expect(
			verifyPassword('plain-password', 'hashed-password')
		).rejects.toMatchObject({
			code: ErrorCode.PASSWORD_VERIFY_FAILED,
		});
	});
});
