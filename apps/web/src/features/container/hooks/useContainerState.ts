import { useGetContainerStateQuery } from '@features/container/api';

/**
 * Fetches and exposes the full state of a container.
 *
 * @param containerId - The container to watch.
 *
 * @remarks
 * Thin wrapper over RTK Query — keeps components decoupled
 * from the slice import path and provides a stable interface
 * if the fetching strategy changes (e.g. polling, websocket).
 *
 * The query re-runs automatically when RTK invalidates the
 * CONTAINER tag after any pack / unpack / move mutation.
 */
const useContainerState = (containerId: string) => {
	const { data, isLoading, isError, isFetching, refetch } =
		useGetContainerStateQuery(containerId);

	return {
		containerState: data?.data ?? null,
		isLoading,
		isFetching,
		isError,
		refetch,
	};
};

export default useContainerState;
