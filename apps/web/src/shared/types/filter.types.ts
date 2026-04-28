import type {
	UserFilterInput,
	ItemFilterInput,
	BagFilterInput,
} from '@beggy/shared/types';

/**
 * Replaces Date fields in a date range with their ISO string equivalents.
 * Used to keep filter state Redux-serializable while the schema uses z.date().
 */
type SerializableDateRange = {
	from?: string | null;
	to?: string | null;
};

/**
 * Replaces any { from?: Date, to?: Date } shape in a filter type
 * with SerializableDateRange so filter state is safe to store in Redux.
 */
export type SerializableFilter<T> = {
	[K in keyof T]: NonNullable<T[K]> extends {
		from?: Date | null;
		to?: Date | null;
	}
		? SerializableDateRange | null | undefined
		: T[K];
};

/**
 * Frontend-safe version of UserFilterInput.
 * Date fields use ISO strings instead of Date objects
 * so filter state can be stored in Redux without serialization errors.
 */
export type UserFilterState = SerializableFilter<UserFilterInput>;

export type BagFilterState = SerializableFilter<BagFilterInput>;

export type ItemFilterState = SerializableFilter<ItemFilterInput>;
