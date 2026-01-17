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

export * from './constraints.js';
export * from './api.enums.js';
export * from './auth.enums.js';
export * from './bag.enums.js';
export * from './constraints.enums.js';
export * from './item.enums.js';
export * from './profile.enums.js';
export * from './suitcase.enums.js';
export * from './user.enums.js';
export * from './error.codes.js';
export * from './messages.js';
export * from './permissions.js';
