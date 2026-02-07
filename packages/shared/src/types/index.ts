export * from './api.types';
export * from './auth.types';
export * from './bag.types';
export * from './item.types';
export * from './constraints.types';
export * from './profile.types';
export * from './schema.types';
export * from './suitcase.types';
export * from './user.types';

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

export type ISODateString = string;
