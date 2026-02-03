import type {
	ValidationErrorResponse,
	ErrorResponse,
} from '@beggy/shared/types';

export interface ApiError<T extends ErrorResponse = ErrorResponse> {
	status: number;
	data: T;
}

export type ApiValidationError = ApiError<ValidationErrorResponse>;
