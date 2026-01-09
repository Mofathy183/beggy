/**
 * Centralized validation constraints for the Beggy domain.
 *
 * @remarks
 * This file defines all shared, declarative validation rules used across:
 * - API request validation (Zod)
 * - Frontend form validation
 * - Error message consistency
 *
 * IMPORTANT:
 * - This file contains NO logic.
 * - Only constraints, limits, and patterns.
 * - Changes here affect both web and API consumers.
 */

export * from './constraints';
export * from './error.codes';
export * from './messages';
export * from './permissions';
