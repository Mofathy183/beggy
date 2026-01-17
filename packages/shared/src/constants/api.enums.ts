/**
 * Ordering direction for sortable queries.
 *
 * @remarks
 * - Lowercase values align with URL query standards
 * - Shared between frontend and backend to prevent drift
 */
export enum OrderDirection {
	ASC = 'asc',
	DESC = 'desc',
}
