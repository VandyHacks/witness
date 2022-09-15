import { Table, Tag, Button } from 'antd';
import React from 'react';

import { TeamData, ScoreData, UserData } from '../types/database';
import { ExportToCsv } from 'export-to-csv';

export interface ApplicantsDisplayProps {
	usersData: UserData[];
}

const newCols = [
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name',
	},
    {
		title: 'Email',
		dataIndex: 'email',
		key: 'email',
	},
    {
		title: 'Grad Year',
		dataIndex: 'gradYear',
		key: 'gradYear',
	},
    {
		title: 'School',
		dataIndex: 'school',
		key: 'school',
	},
    {
		title: 'Flight?',
		dataIndex: 'flight',
		key: 'flight',
	},
    {
		title: 'Status',
		dataIndex: 'status',
		key: 'status',
	},
];

const APPLICATION_STATUSES = [
    "Created",
    "Declined",
    "Started",
    "Submitted",
    "Accepted",
    "Confirmed",
    "Rejected",
]

export const exportCSV: any = (work: any) => {
	const csvExporter = new ExportToCsv({
		filename: 'judging-data',
		showLabels: true,
		headers: newCols.map((col: any) => col.title),
	});
	csvExporter.generateCsv(work);
};

export default function ApplicantsDisplay(props: ApplicantsDisplayProps) {
	let data = props;
	let usersData = props.usersData;

	let work = usersData.map(user => {
		return {
			...user,
            status: APPLICATION_STATUSES[user.applicationStatus],
		};
	});

	return (
		<>
			
		</>
	);
}
