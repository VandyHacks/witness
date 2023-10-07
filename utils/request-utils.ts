import useSWR from 'swr';
import { ResponseError } from '../types/database';
import { useEffect, useState } from 'react';

/**
 * A custom hook that fetches data from the specified URL and returns the data, loading status, and error.
 * Requires template type T to be specified.
 *
 * @param url - The URL to fetch data from.
 * @param method - The HTTP method to use for the request.
 * @param errorMessage - Optional error message to display if the request fails.
 * @example
 * ```tsx
 * const { data, error, isLoading } = useCustomSWR<TeamData[]>({
 *         url: '/api/teams',
 *         method: RequestType.GET,
 *         errorMessage: 'Failed to fetch teams.'
 * });
 * ```
 */
export const useCustomSWR = <T>(params: CustomerSWRParams) => {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<ResponseError | null>(null);

	const { data: requestData, error: requestError } = useSWR(params.url, async url => {
		const res = await fetch(url, { method: params.method });
		if (!res.ok) {
			const error = new Error(
				params.errorMessage || 'An error occurred while fetching data from the server.'
			) as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as T;
	});

	useEffect(() => {
		if (requestData) {
			setData(requestData);
		}
		if (requestError) {
			setError(requestError);
		}
	}, [requestData, requestError]);

	return { data, error };
};

/*
 * All possible HTTP request types
 */
export enum RequestType {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
}

/**
 * Parameters for the useCustomSWR hook
 */
export interface CustomerSWRParams {
	url: string;
	method: RequestType;
	errorMessage?: string;
}
