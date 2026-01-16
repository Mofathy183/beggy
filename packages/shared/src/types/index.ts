export * from './api.types.js';
export * from './auth.types.js';
export * from './bag.types.js';
export * from './item.types.js';
export * from './constraints.types.js';
export * from './profile.types.js';
export * from './schema.types.js';
export * from './suitcase.types.js';
export * from './user.types.js';

/**
 * Overrides selected fields in Zod-derived types.
 *
 * Used to re-assert required domain constraints where Zod v4
 * input/output types intentionally include nullish or unknown values
 * due to preprocessing and optional field modeling.
 */
export type Override<Base, Overrides extends Partial<Base>> = Omit<
	Base,
	keyof Overrides
> &
	Overrides;
