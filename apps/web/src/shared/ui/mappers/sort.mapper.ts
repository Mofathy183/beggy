import { OrderDirection } from '@beggy/shared/constants';

import { UserOrderByField, ProfileOrderByField } from '@beggy/shared/constants';

type SortValue<E extends string> = {
	orderBy: E;
	direction: OrderDirection;
};

export type UiOrderByOption<T extends string> = {
	value: SortValue<T>;
	label: string;
	icon?: React.ComponentType<{ className?: string }>;
	disabled?: boolean;
};

export function createBaseSortOptions<E extends string>(fields: {
	createdAt?: E;
	updatedAt?: E;
}): UiOrderByOption<E>[] {
	const options: UiOrderByOption<E>[] = [];

	if (fields.createdAt) {
		options.push(
			{
				value: {
					orderBy: fields.createdAt,
					direction: OrderDirection.DESC,
				},
				label: 'Newest',
			},
			{
				value: {
					orderBy: fields.createdAt,
					direction: OrderDirection.ASC,
				},
				label: 'Oldest',
			}
		);
	}

	if (fields.updatedAt) {
		options.push({
			value: {
				orderBy: fields.updatedAt,
				direction: OrderDirection.DESC,
			},
			label: 'Recently updated',
		});
	}

	return options;
}

export const USER_SORT_OPTIONS: UiOrderByOption<UserOrderByField>[] = [
	//* only Admins
	{
		value: {
			orderBy: UserOrderByField.EMAIL,
			direction: OrderDirection.ASC,
		},
		label: 'Email',
	},
	{
		value: {
			orderBy: UserOrderByField.ROLE,
			direction: OrderDirection.ASC,
		},
		label: 'Role',
	},
];

export const PROFILE_SORT_OPTIONS: UiOrderByOption<ProfileOrderByField>[] = [
	{
		value: {
			orderBy: ProfileOrderByField.FIRST_NAME,
			direction: OrderDirection.ASC,
		},
		label: 'First name',
	},
	{
		value: {
			orderBy: ProfileOrderByField.LAST_NAME,
			direction: OrderDirection.ASC,
		},
		label: 'Last name',
	},
];
