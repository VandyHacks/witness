import { Table, Tag, Button, Checkbox, Modal, Input } from 'antd';
import type { InputRef } from 'antd';
import React, { useState, useRef, useEffect } from 'react';

import { ApplicationData, UserData } from '../types/database';
import { ExportToCsv } from 'export-to-csv';
import { CheckCircleOutlined, EyeOutlined, CheckSquareTwoTone, CheckOutlined } from '@ant-design/icons';
import { DateTime } from 'luxon';

export interface ApplicantsDisplayProps {
	hackers: UserData[];
	applications: ApplicationData[];
}

const APPLICATION_STATUSES = [
	'Created',
	'Declined',
	'Started',
	'Submitted',
	'Accepted',
	'Confirmed',
	'Rejected',
	'Checked In',
];

const STATUS_COLORS = {
	Created: 'magenta',
	Declined: 'red',
	Started: 'cyan',
	Submitted: 'gold',
	Accepted: 'success',
	Confirmed: 'purple',
	Rejected: 'volcano',
	'Checked In': 'green',
};

const APPLICATION_KEY_MAP = {
	firstName: 'First Name',
	lastName: 'Last Name',
	preferredName: 'Preferred Name',
	gender: 'Gender',
	dateOfBirth: 'Date of Birth',
	phoneNumber: 'Phone Number',
	school: 'School',
	major: 'Major',
	graduationYear: 'Graduation Year',
	address1: 'Address 1',
	address2: 'Address 2',
	city: 'City',
	state: 'State',
	zip: 'Zip',
	race: 'Race',
	dietaryRestrictions: 'Dietary Restrictions',
	accommodationNeeds: 'Accomodation Needs',
	firstTime: 'First Time',
	whyAttend: 'Why attend',
	techIndustry: 'Tech Industry',
	techStack: 'Tech Stack',
	passion: 'Passion',
	motivation: 'Motivation',
	shirtSize: 'Shirt Size',
	applyTravelReimbursement: 'Apply Travel Reimbursement',
	overnight: 'Overnight',
	prizeEligibility: 'Prize Eligibility',
	volunteer: 'Volunteer',
	mlhComms: 'MLH Communications',
};

export default function ApplicantsDisplay(props: ApplicantsDisplayProps) {
	const [isAppModalOpen, setIsAppModalOpen] = useState(false);
	const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
	const [singleApplicant, setSingleApplicant] = useState<ApplicationData | null>(null);
	const checkinInputRef = useRef<InputRef>(null);

	useEffect(() => {
		// wait for modal to open then focus input
		requestAnimationFrame(() => {
			if (isCheckinModalOpen && checkinInputRef?.current) {
				checkinInputRef.current.focus({
					cursor: 'start',
				});
			}
		});
	}, [isCheckinModalOpen]);

	let hackers = props.hackers;
	let applications = props.applications.reduce((acc, application) => {
		return { ...acc, [application._id.toString()]: application };
	}, {});
	let allApplicantsData = hackers.map(hacker => {
		let application = hacker.application ? (applications as any)[hacker.application.toString()] : {};
		return {
			name: hacker.name,
			email: hacker.email,
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
			title: 'Actions',
			render: (text: any, record: any) => (
				<>
					{record.status === 'Accepted' && (
						<Button shape="circle" icon={<CheckOutlined />} onClick={() => openCheckinModal(record._id)} />
					)}
					&nbsp;&nbsp;
					{record.status !== 'Created' && (
						<Button shape="circle" icon={<EyeOutlined />} onClick={() => openAppModal(record._id)} />
					)}
				</>
			),
		},
	];

	const openCheckinModal = (id: string) => {
		setSingleApplicant(allApplicantsData.find(applicant => applicant.key === id));
		setIsCheckinModalOpen(true);
	};

	const handleCheckinCloseModal = () => {
		setIsCheckinModalOpen(false);
	};

	const openAppModal = (id: string) => {
		setSingleApplicant(allApplicantsData.find(applicant => applicant._id === id));
		// do a get request to get the application data
		setIsAppModalOpen(true);
	};

	const handleAppCloseModal = () => {
		setIsAppModalOpen(false);
	};

	const createSingleApplicantEntry = ([field, response]: [string, string | boolean | string[] | undefined]) => {
		console.log(field, response);
		switch (typeof response) {
			case 'string':
				const dateTime = DateTime.fromISO(response);
				response = dateTime.isValid ? dateTime.toLocaleString(DateTime.DATE_MED) : response;
				response = response === '' ? undefined : response;
				break;
			case 'boolean':
				response = response ? 'Yes' : 'No';
				break;
			case 'object':
				response = response.length === 0 ? 'None' : response.join(', ');
				break;
		}

		return (
			<p key={field}>
				{(APPLICATION_KEY_MAP as any)[field]}: {response ? response : <i>Not provided</i>}
			</p>
		);
	};

	return (
		<>
			<Table style={{ width: '95vw' }} dataSource={allApplicantsData} columns={newCols}></Table>
			{isAppModalOpen && (
				<Modal
					title="Hacker's Application Form"
					visible={isAppModalOpen}
					onOk={handleAppCloseModal}
					onCancel={handleAppCloseModal}>
					{singleApplicant &&
						Object.entries(singleApplicant)
							.filter(([field, _]) => field in APPLICATION_KEY_MAP)
							.map(createSingleApplicantEntry)}
				</Modal>
			)}
			{isCheckinModalOpen && (
				<Modal
					title="Check in"
					open={isCheckinModalOpen}
					onOk={handleCheckinCloseModal}
					onCancel={handleCheckinCloseModal}>
					<Input placeholder="Enter NFC ID" ref={checkinInputRef} onPressEnter={() => console.log('ligma')} />
				</Modal>
			)}
		</>
	);
}
