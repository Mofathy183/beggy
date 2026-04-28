import { useGetContainerQuery } from '@features/containers/api';

const useGetContainer = (containerId: string, skip: boolean) => {
	const { data, isLoading, isError, isFetching, refetch } =
		useGetContainerQuery(containerId, { skip });

	return {
		container: data?.data ?? null,
		isLoading,
		isFetching,
		isError,
		refetch,
	};
};

export default useGetContainer;
