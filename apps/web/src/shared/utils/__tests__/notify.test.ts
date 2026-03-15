import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'sonner';

import { notify } from '../notify.utils';
import type { HttpClientError } from '@shared/types';

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		warning: vi.fn(),
		info: vi.fn(),
	},
}));

describe('notify', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('success', () => {
		it('shows a success toast with the default duration', () => {
			notify.success({ message: 'Saved!' });

			expect(toast.success).toHaveBeenCalledWith(
				'Saved!',
				expect.objectContaining({
					duration: 4000,
				})
			);
		});

		it('shows a success toast with a description when provided', () => {
			notify.success({
				message: 'Profile updated',
				description: 'Changes saved',
			});

			expect(toast.success).toHaveBeenCalledWith(
				'Profile updated',
				expect.objectContaining({
					description: 'Changes saved',
				})
			);
		});
	});

	describe('error', () => {
		it('shows an error toast with the suggestion as the description', () => {
			notify.error({
				message: 'Delete failed',
				suggestion: 'Try refreshing',
			});

			expect(toast.error).toHaveBeenCalledWith(
				'Delete failed',
				expect.objectContaining({
					description: 'Try refreshing',
					duration: 6000,
				})
			);
		});
	});

	describe('error.fromHttp', () => {
		it('shows an error toast using the message and suggestion from the http error', () => {
			const err = {
				body: {
					message: 'Item not found',
					suggestion: 'Refresh the page',
					code: 'ITEM_NOT_FOUND',
				},
				statusCode: 404,
			} as HttpClientError;

			notify.error.fromHttp(err);

			expect(toast.error).toHaveBeenCalledWith(
				'Item not found',
				expect.objectContaining({
					description: 'Refresh the page',
					duration: 6000,
				})
			);
		});
	});

	describe('warning', () => {
		it('shows a warning toast with the default duration', () => {
			notify.warning({
				message: 'Bag is almost full',
			});

			expect(toast.warning).toHaveBeenCalledWith(
				'Bag is almost full',
				expect.objectContaining({
					duration: 5000,
				})
			);
		});
	});

	describe('info', () => {
		it('shows an info toast with a description', () => {
			notify.info({
				message: 'Tip',
				description: 'Add items first',
			});

			expect(toast.info).toHaveBeenCalledWith(
				'Tip',
				expect.objectContaining({
					description: 'Add items first',
				})
			);
		});
	});
});
