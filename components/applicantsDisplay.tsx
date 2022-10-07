import { Table, Tag, Button, Checkbox, Modal, Input, Popover, Space } from 'antd';
import type { InputRef } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import { ApplicationStatus, UserData } from '../types/database';
import {
	CheckCircleOutlined,
	EyeOutlined,
	CheckOutlined,
	ExclamationCircleOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { DateTime } from 'luxon';
import type { ColumnsType, FilterValue, FilterConfirmProps } from 'antd/es/table/interface';
import { useSWRConfig } from 'swr';
import { ScopedMutator } from 'swr/dist/types';
import Highlighter from 'react-highlight-words';
import { handleSubmitFailure, handleSubmitSuccess } from '../lib/helpers';

export interface ApplicantsDisplayProps {
	hackers: UserData[];
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

const acceptReject = (id: string, applicationStatus: ApplicationStatus, mutate: ScopedMutator, hackers: any) => {
	fetch('/api/accept-reject', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			id,
			applicationStatus,
		}),
	}).then(() => {
		const newHackers: UserData[] = JSON.parse(JSON.stringify(hackers)); // Deep copies the object
		const idx = newHackers.findIndex((x: any) => x._id === id);
		newHackers[idx].applicationStatus = applicationStatus;
		mutate(
			'/api/users?usertype=HACKER',
			async () => {
				return newHackers;
			},
			{ revalidate: false }
		);
	});
};

const createPopover = (record: any, mutate: ScopedMutator, hackers: any) => {
	return (
		<div>
			<Button type="dashed" onClick={() => acceptReject(record._id, ApplicationStatus.REJECTED, mutate, hackers)}>
				<ExclamationCircleOutlined />
				Reject
			</Button>
			<Button
				type="primary"
				style={{ marginLeft: '8px' }}
				onClick={() => acceptReject(record._id, ApplicationStatus.ACCEPTED, mutate, hackers)}>
				<CheckCircleOutlined />
				Accept
			</Button>
		</div>
	);
};

export default function ApplicantsDisplay(props: ApplicantsDisplayProps) {
	const hackers = props.hackers.map(x => ({ ...x, key: x._id }));

	const [isAppModalOpen, setIsAppModalOpen] = useState(false);
	const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
	const [selectedApplicant, setSelectedApplicant] = useState<UserData | null>(null);
	const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
	const [searchText, setSearchText] = useState('');
	const [searchedColumn, setSearchedColumn] = useState('');

	const checkinInputRef = useRef<InputRef>(null);
	const searchInput = useRef<InputRef>(null);

	const { mutate } = useSWRConfig();

	useEffect(() => {
		if (isCheckinModalOpen) {
			// wait for modal to open then focus input
			requestAnimationFrame(() => {
				checkinInputRef.current?.focus();
			});
		}
	}, [isCheckinModalOpen]);

	const handleUserCheckin = async () => {
		const res = await fetch('/api/user-checkin', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				userId: selectedApplicant?._id,
				nfcId: checkinInputRef.current?.input?.value,
			}),
		});

		if (res.ok) {
			setIsCheckinModalOpen(false);
			mutate('/api/users?usertype=HACKER');
			handleSubmitSuccess(await res.text());
		} else handleSubmitFailure(await res.text());
	};

	const clearFilters = () => {
		setFilteredInfo({});
		setSearchText('');
	};

	const handleChange = (pagination: any, filters: any, sorter: any) => {
		setFilteredInfo(filters);
	};

	const handleSearch = (
		selectedKeys: string[],
		confirm: (param?: FilterConfirmProps) => void,
		dataIndex: string,
		closeDropDown: boolean
	) => {
		confirm({ closeDropdown: closeDropDown });
		setSearchText(selectedKeys[0]);
		setSearchedColumn(dataIndex);
	};

	const handleReset = (clearFilters: () => void) => {
		clearFilters();
		setSearchText('');
	};

	const getColumnSearchProps = (dataIndex: string) => ({
		filterDropdown: ({
			setSelectedKeys,
			selectedKeys,
			confirm,
			clearFilters,
		}: {
			setSelectedKeys: (selectedKeys: React.Key[]) => void;
			selectedKeys: React.Key[];
			confirm: (param?: FilterConfirmProps) => void;
			clearFilters: () => void;
		}) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={searchInput}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={e => {
						setSelectedKeys(e.target.value ? [e.target.value] : []);
						handleSearch(selectedKeys as string[], confirm, dataIndex, false);
					}}
					onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex, true)}
					style={{ marginBottom: 8, display: 'block' }}
				/>
				<Button
					onClick={() => {
						clearFilters && handleReset(clearFilters);
						confirm({ closeDropdown: false });
					}}
					style={{ width: '100%' }}>
					Reset
				</Button>
			</div>
		),
		filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
		onFilter: (value: string | number | boolean, record: any): boolean => {
			const recordValue = dataIndex in record ? record[dataIndex] : record.application?.[dataIndex];
			if (recordValue === undefined || recordValue === null) {
				return false;
			}
			return recordValue.toString().toLowerCase().includes(value.toString().toLowerCase());
		},
		filteredValue:
			(dataIndex in filteredInfo ? filteredInfo[dataIndex] : filteredInfo['application.' + dataIndex]) || null,
		onFilterDropdownOpenChange: (open: boolean) => {
			if (open) {
				setTimeout(() => searchInput.current?.select(), 100);
			}
		},
		render: (text: string) =>
			searchedColumn === dataIndex ? (
				<Highlighter
					highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
					searchWords={[searchText]}
					autoEscape
					textToHighlight={text?.toString() ?? ''}
				/>
			) : (
				text
			),
	});

	const openResume = async (id: string) => {
		window.open(`/api/get-resume?id=${id}`, '_blank');
	};

	const newCols: ColumnsType<UserData> = [
		{
			title: 'Login Name',
			dataIndex: 'name',
		},
		{
			title: 'First Name',
			dataIndex: ['application', 'firstName'],
			...getColumnSearchProps('firstName'),
		},
		{
			title: 'Last Name',
			dataIndex: ['application', 'lastName'],
			...getColumnSearchProps('lastName'),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			...getColumnSearchProps('email'),
		},
		{
			title: 'Graduation Year',
			dataIndex: ['application', 'graduationYear'],
			filters: [
				{ text: '2022', value: '2022' },
				{ text: '2023', value: '2023' },
				{ text: '2024', value: '2024' },
				{ text: '2025', value: '2025' },
				{ text: '2026', value: '2026' },
				{ text: 'Other', value: 'Other' },
			],
			filteredValue: filteredInfo['application.graduationYear'] || null,
			onFilter: (value: string | number | boolean, record: any): boolean =>
				record.application?.graduationYear === value,
		},
		{
			title: 'School',
			dataIndex: ['application', 'school'],
			...getColumnSearchProps('school'),
		},
		{
			title: 'Resume',
			// If a user has a valid school field, that means they submitted the form and have also submitted a resume
			render: (_: any, record: any) =>
				record.application?.school && <Button onClick={() => openResume(record.key)}>Open Resume</Button>,
		},
		{
			title: '✈️',
			dataIndex: ['application', 'applyTravelReimbursement'],
			filters: [{ text: '✈️', value: true }],
			filteredValue: filteredInfo['application.applyTravelReimbursement'] || null,
			onFilter: (value: string | number | boolean, record: any): boolean =>
				record.application?.applyTravelReimbursement === value,
			render: (appliedTravel?: boolean) =>
				appliedTravel !== undefined ? <Checkbox checked={appliedTravel} /> : '',
		},
		{
			title: 'Status',
			dataIndex: 'applicationStatus',
			filters: [
				{ text: 'Accepted', value: ApplicationStatus.ACCEPTED },
				{ text: 'Created', value: ApplicationStatus.CREATED },
				{ text: 'Rejected', value: ApplicationStatus.REJECTED },
				{ text: 'Submitted', value: ApplicationStatus.SUBMITTED },
				{ text: 'Checked In', value: ApplicationStatus.CHECKED_IN },
			],
			filteredValue: filteredInfo.applicationStatus || null,
			onFilter: (value: string | number | boolean, record: any): boolean => record.applicationStatus == value,
			render: (applicationStatus: ApplicationStatus, record: any) => {
				const statusName = APPLICATION_STATUSES[applicationStatus as number];
				if (statusName === 'Submitted') {
					return (
						<Popover placement="left" content={createPopover(record, mutate, props.hackers)}>
							<Tag color={(STATUS_COLORS as any)[statusName]}>{statusName}</Tag>
						</Popover>
					);
				} else if (statusName) {
					return <Tag color={(STATUS_COLORS as any)[statusName]}>{statusName}</Tag>;
				}

				return '';
			},
		},
		{
			title: 'Actions',
			render: (text: any, record: any) => (
				<>
					{record.applicationStatus === ApplicationStatus.ACCEPTED && (
						<Button shape="circle" icon={<CheckOutlined />} onClick={() => openCheckinModal(record)} />
					)}
					&nbsp;&nbsp;
					{record.applicationStatus !== ApplicationStatus.CREATED && (
						<Button shape="circle" icon={<EyeOutlined />} onClick={() => openAppModal(record)} />
					)}
				</>
			),
		},
	];

	const openCheckinModal = (applicant: UserData) => {
		setSelectedApplicant(applicant);
		setIsCheckinModalOpen(true);
	};

	const handleCheckinCloseModal = () => {
		setIsCheckinModalOpen(false);
	};

	const openAppModal = (applicant: UserData) => {
		setSelectedApplicant(applicant);
		setIsAppModalOpen(true);
	};

	const handleAppCloseModal = () => {
		setIsAppModalOpen(false);
	};

	const createSingleApplicantEntry = ([field, response]: [string, string | boolean | string[] | undefined]) => {
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
			<Space style={{ marginBottom: 16, float: 'right' }}>
				<Button type="primary" onClick={clearFilters}>
					Clear filters
				</Button>
			</Space>
			<Table style={{ width: '95vw' }} dataSource={hackers} columns={newCols} onChange={handleChange}></Table>
			{isAppModalOpen && (
				<Modal
					title="Hacker's Application Form"
					visible={isAppModalOpen}
					onOk={handleAppCloseModal}
					onCancel={handleAppCloseModal}>
					{selectedApplicant &&
						Object.entries(selectedApplicant.application!)
							.filter(([field, _]) => field in APPLICATION_KEY_MAP)
							.map(createSingleApplicantEntry)}
				</Modal>
			)}
			{isCheckinModalOpen && (
				<Modal
					title="Check in"
					open={isCheckinModalOpen}
					onOk={handleUserCheckin}
					onCancel={handleCheckinCloseModal}
					footer={[
						<Button key="submit" type="primary" onClick={handleUserCheckin}>
							Check in
						</Button>,
					]}>
					<Input placeholder="NFC ID" ref={checkinInputRef} onPressEnter={handleUserCheckin} />
				</Modal>
			)}
		</>
	);
}
