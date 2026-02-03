import type { FieldErrorsTree } from '@beggy/shared/types';
import { ErrorCode } from '@beggy/shared/constants';
import type { ApiError, ApiValidationError } from '@shared/types';

/**
 * Narrow unknown values into ApiError.
 */
export const isApiError = (error: unknown): error is ApiError => {
	return (
		typeof error === 'object' &&
		error !== null &&
		'status' in error &&
		'data' in error
	);
};

/**
 * Check if the error represents a validation failure.
 */
export const isValidationError = (
	error: unknown
): error is ApiValidationError => {
	if (!isApiError(error)) return false;

	return error.data.code === ErrorCode.INVALID_REQUEST_DATA;
};

/**
 * Extract structured field validation errors if present.
 *
 * Returns null if the error is not a validation error.
 */
export const getFieldErrors = (
	error: unknown
): Record<string, FieldErrorsTree> | null => {
	if (!isValidationError(error)) return null;

	return error.data.fieldErrors;
};
