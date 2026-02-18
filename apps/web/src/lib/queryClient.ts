import { DefaultOptions, QueryClient } from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
	queries: {
		retry: 1,
		refetchOnWindowFocus: false,
		staleTime: 10 * 1000,
		retryDelay: (attemptIndex: number) =>
			Math.min(1000 * 2 ** attemptIndex, 30000),
	},
};

export const queryClient = new QueryClient({
	defaultOptions: queryConfig,
});
