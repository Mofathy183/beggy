import { isApiError, isValidationError, getFieldErrors } from '@shared/utils';
import type { ApiError, ApiValidationError } from '@shared/types';

export const useApiError = (error: unknown): ApiError | null => {
	if (!isApiError(error)) return null;

	return {
		status: error.status,
		data: error.data,
	};
};

export const useApiValidationError = (
	error: unknown
): ApiValidationError | null => {
	if (!isValidationError(error)) return null;

	return {
		status: error.status,
		data: {
			...error.data,
			fieldErrors: getFieldErrors(error.data.fieldErrors) ?? {},
		},
	};
};
