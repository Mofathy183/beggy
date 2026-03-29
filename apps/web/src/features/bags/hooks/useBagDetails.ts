import { useGetBagByIdQuery } from '@features/bags/api';
import type { BagDTO } from '@beggy/shared/types';

/**
 * useBagDetails
 *
 * Fetches a single bag by ID.
 *
 * @description
 * Skips the query when no ID is provided — safe to call from
 * detail pages that read ID from params before it resolves.
 * The returned bag already includes a fully computed
 * `ContainerStatusDTO` from the API mapper.
 *
 * @example
 * const { bag, isLoading, isError, refetch } = useBagDetails(id);
 */
const useBagDetails = (id: string | undefined) => {
	const { data, isLoading, isFetching, isError, error, refetch } =
		useGetBagByIdQuery(id as string, {
			skip: !id,
		});

	const bag: BagDTO | undefined = data?.data;

	return {
		bag,
		isLoading,
		isFetching,
		isError,
		error,
		refetch,
	} as const;
};

export default useBagDetails;
