import { Table } from 'antd';

import useSWR from 'swr';
import { DietaryData, ResponseError, UserData } from '../../../types/database';
import { RequestType, useCustomSWR } from '../../../utils/request-utils';
import React, { useState, useRef, useEffect } from 'react';

export default function Analytics() {
	const { data: dietaryData, error: dietaryError } = useCustomSWR<DietaryData[]>({
		url: '/api/dietary-restrictions',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of dietary data.',
	});
	console.log('dietaryData:', dietaryData); // Add this to debug

	const columns = [
		{
			title: 'Dietary Restriction',
			dataIndex: '_id', // Corresponds to the _id field in the data
			key: '_id',
		},
		{
			title: 'Count',
			dataIndex: 'count', // Corresponds to the count field in the data
			key: 'count',
		},
	];

	// Format the dietary data to add a unique 'key' for each row
	const formattedDietaryData = dietaryData
		? dietaryData.map((restriction: DietaryData) => ({
				...restriction,
				key: restriction._id, // Use _id as key or fallback to index
		  }))
		: undefined;

	// Hacker data
	const { data: hackersData, error: hackersError } = useCustomSWR<UserData[]>({
		url: '/api/users?usertype=HACKER',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of hackers.',
	});

	return (
		<>
			<Table columns={columns} dataSource={formattedDietaryData}></Table>
			<p>Hacker Count: {hackersData?.length}</p>
		</>
	);
}
