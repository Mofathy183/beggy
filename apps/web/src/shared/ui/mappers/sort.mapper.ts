import type { UiOption } from './types';
import {
	OrderDirection,
	UserOrderByField,
	ProfileOrderByField,
} from '@beggy/shared/constants';

export function createBaseSortOptions<E extends string>(fields: {
	createdAt?: E;
	updatedAt?: E;
}): UiOption<E>[] {
	const options: UiOption<E>[] = [];

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

export const USER_SORT_OPTIONS: UiOption<UserOrderByField>[] = [
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

export const PROFILE_SORT_OPTIONS: UiOption<ProfileOrderByField>[] = [
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
