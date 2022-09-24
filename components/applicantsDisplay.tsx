import { Table, Tag, Button, Checkbox, Modal } from 'antd';
import React, { useState } from 'react';

import { ApplicationData, UserData } from '../types/database';
import { ExportToCsv } from 'export-to-csv';

export interface ApplicantsDisplayProps {
	hackers: UserData[];
	applications: ApplicationData[];
}

const APPLICATION_STATUSES = ['Created', 'Declined', 'Started', 'Submitted', 'Accepted', 'Confirmed', 'Rejected'];

const STATUS_COLORS = {
	Created: 'magenta',
	Declined: 'red',
	Started: 'cyan',
	Submitted: 'gold',
	Accepted: 'success',
	Confirmed: 'purple',
	Rejected: 'volcano',
};

export default function ApplicantsDisplay(props: ApplicantsDisplayProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [singleApplicant, setSingleApplicant] = useState<ApplicationData | null>(null);
	let hackers = props.hackers;
	let applications = props.applications.reduce((acc, application) => {
		return { ...acc, [application._id.toString()]: application };
	}, {});
	let allApplicantsData = hackers.map(hacker => {
		let application = hacker.application ? (applications as any)[hacker.application.toString()] : {};
		return {
			name: hacker.name,
			...application,
			status: APPLICATION_STATUSES[hacker.applicationStatus],
			key: hacker._id,
		};
	});

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
			render: (appliedTravel?: boolean) =>
				appliedTravel !== undefined ? <Checkbox checked={appliedTravel} /> : '',
		},
		{
			title: 'Status',
			dataIndex: 'status',
			render: (status?: string) => (status ? <Tag color={(STATUS_COLORS as any)[status]}>{status}</Tag> : ''),
		},
		{
			title: 'Action',
			render: (text: any, record: any) => (
				<>
					{/* User id is record._id */}
					{/* TODO: make buttons functional & style them accordingly */}
					{/* Dropdown or buttons? */}
					{/* <Button>Accept</Button> */}
					{/* undecided = ApplicationStatus.APPLIED */}
					{/* <Button>Undecided</Button> */}
					{/* <Button>Reject</Button> */}
				</>
			),
		},
		{
			title: 'More Info',
			key: 'action',
			render: (text: any, record: any) =>
				record.status != 'Created' ? <Button onClick={() => openModal(record._id)}>View</Button> : <></>,
		},
	];

	const openModal = (id: string) => {
		setSingleApplicant(allApplicantsData.find(applicant => applicant._id === id));
		// do a get request to get the application data
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	return (
		<>
			<Table dataSource={allApplicantsData} columns={newCols}></Table>
			{isModalOpen && (
				<Modal
					title="Hacker's Application Form"
					visible={isModalOpen}
					onOk={handleCloseModal}
					onCancel={handleCloseModal}>
					<p>First Name: {singleApplicant?.firstName ? singleApplicant.firstName : 'Not Provided'}</p>
					<p>Last name: {singleApplicant?.lastName}</p>
				</Modal>
			)}
		</>
	);
}
