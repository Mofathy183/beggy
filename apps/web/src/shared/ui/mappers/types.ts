import { OrderDirection } from '@beggy/shared/constants';

export type SortValue<E extends string> = {
	orderBy: E;
	direction: OrderDirection;
};

export type UiOption<T extends string> = {
	value: SortValue<T>;
	label: string;
	icon?: React.ComponentType<{ className?: string }>;
	disabled?: boolean;
};
