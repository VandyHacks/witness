import { Table, Tag, Button, Checkbox } from 'antd';
import React from 'react';

import { ApplicationData, UserData } from '../types/database';
import { ExportToCsv } from 'export-to-csv';
import team from '../models/team';

export interface ApplicantsDisplayProps {
	hackers: UserData[],
	applications: ApplicationData[];
}

const APPLICATION_STATUSES = [
	"Created",
	"Declined",
	"Started",
	"Submitted",
	"Accepted",
	"Confirmed",
	"Rejected",
]

const STATUS_COLORS = {
	"Created": "magenta",
	"Declined": "red",
	"Started": "cyan",
	"Submitted": "gold",
	"Accepted": "success",
	"Confirmed": "purple",
	"Rejected": "volcano",
};

const newCols = [
	{
		title: 'Login Name',
		dataIndex: 'name',
	},
	{
		title: 'First Name',
		dataIndex: 'firstName',
	},
	{
		title: 'Last Name',
		dataIndex: 'lastName',
	},
	{
		title: 'Email',
		dataIndex: 'email',
	},
	{
		title: 'Graduation Year',
		dataIndex: 'graduationYear',
	},
	{
		title: 'School',
		dataIndex: 'school',
	},
	{
		title: '✈️',
		dataIndex: 'applyTravelReimbursement',
		render: (appliedTravel?: boolean) => (appliedTravel !== undefined) ? <Checkbox checked={appliedTravel} /> : '',
	},
	{
		title: 'Status',
		dataIndex: 'status',
		render: (status?: string) => (status) ? <Tag color={(STATUS_COLORS as any)[status]}>{status}</Tag> : '',
	},
];

export const exportCSV: any = (work: any) => {
	const csvExporter = new ExportToCsv({
		filename: 'judging-data',
		showLabels: true,
		headers: newCols.map((col: any) => col.title),
	});
	csvExporter.generateCsv(work);
};

export default function ApplicantsDisplay(props: ApplicantsDisplayProps) {
	let hackers = props.hackers;
	let applications = props.applications.reduce((acc, application) => {
		return {...acc, [application._id.toString()]: application}
	}, {});

	let work = hackers.map(hacker => {
		let application = (hacker.application) ? (applications as any)[hacker.application.toString()] : {};
		return {
			name: hacker.name,
			...application,
			status: APPLICATION_STATUSES[hacker.applicationStatus],
			key: hacker._id,
		};
	});

	return (
		<Table dataSource={work} columns={newCols}></Table>
	);
}
