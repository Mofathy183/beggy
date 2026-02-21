import ListOrderBy from '@shared/ui/list/ListOrderBy';
import { createBaseSortOptions } from '@shared/ui/mappers';
import { USER_SORT_OPTIONS } from '@shared/ui/mappers';
import { UserOrderByField, OrderDirection } from '@beggy/shared/constants';
import type { UserOrderByInput } from '@beggy/shared/types';

const baseOptions = createBaseSortOptions<UserOrderByField>({
	createdAt: UserOrderByField.CREATED_AT,
	updatedAt: UserOrderByField.UPDATED_AT,
});

const options = [...baseOptions, ...USER_SORT_OPTIONS];

/**
 * Props for `UsersOrderBy`.
 */
export type UsersOrderByProps = {
	/** Current sorting value. */
	value: UserOrderByInput;

	/** Triggered when sorting changes. */
	onChange: (next: UserOrderByInput) => void;
};

/**
 * Users domain sorting component.
 *
 * Specializes the shared `ListOrderBy` component with
 * user-specific sorting options.
 *
 * Performs a defensive shape check before rendering to
 * ensure a valid sorting structure.
 */
const UsersOrderBy = ({ value, onChange }: UsersOrderByProps) => {
	return (
		<ListOrderBy<UserOrderByField>
			options={options}
			value={
				(value as {
					orderBy: UserOrderByField;
					direction: OrderDirection;
				}) ?? options[0]?.value
			}
			onChange={onChange}
		/>
	);
};

export default UsersOrderBy;
