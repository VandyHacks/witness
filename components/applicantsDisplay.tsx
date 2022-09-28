import { Table, Tag, Button, Checkbox, Modal, Input, Space } from 'antd';
import type { InputRef } from 'antd';
import React, { useState, useRef } from 'react';

import { ApplicationData, UserData } from '../types/database';
import { ExportToCsv } from 'export-to-csv';
import { CheckCircleOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { DateTime } from 'luxon';
import type { ColumnsType, FilterValue, FilterConfirmProps } from 'antd/es/table/interface';
import Highlighter from 'react-highlight-words';

export interface ApplicantsDisplayProps {
	hackers: UserData[];
	applications: ApplicationData[];
}

type DataIndex = keyof UserData[];

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
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [singleApplicant, setSingleApplicant] = useState<ApplicationData | null>(null);
	const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
	const [searchText, setSearchText] = useState('');
	const [searchedColumn, setSearchedColumn] = useState('');
	const searchInput = useRef<InputRef>(null);

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

	const clearFilters = () => {
		setFilteredInfo({});
		setSearchText('');
	};

	const handleChange = (pagination: any, filters: any, sorter: any) => {
		setFilteredInfo(filters);
	};

	const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: string) => {
		confirm();
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
					onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
					style={{ marginBottom: 8, display: 'block' }}
				/>
				<Space>
					<Button
						type="primary"
						onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
						icon={<SearchOutlined />}
						size="small"
						style={{ width: 90, marginRight: 8 }}>
						Search
					</Button>
					<Button
						onClick={() => clearFilters && handleReset(clearFilters)}
						size="small"
						style={{ width: 90 }}>
						Reset
					</Button>
					<Button
						type="link"
						size="small"
						onClick={() => {
							confirm({ closeDropdown: false });
							setSearchText((selectedKeys as string[])[0]);
							setSearchedColumn(dataIndex);
						}}>
						Filter
					</Button>
				</Space>
			</div>
		),
		filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
		onFilter: (value: string | number | boolean, record: any): boolean => {
			if (record[dataIndex] === undefined || record[dataIndex] === null) {
				return false;
			}
			return record[dataIndex].toString().toLowerCase().includes(value.toString().toLowerCase());
		},
		filteredValue: filteredInfo[dataIndex] || null,
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
					textToHighlight={text?.toString()}
				/>
			) : (
				text
			),
	});

	const newCols: ColumnsType<ApplicantsDisplayProps> = [
		{
			title: 'Login Name',
			dataIndex: 'name',
		},
		{
			title: 'First Name',
			dataIndex: 'firstName',
			...getColumnSearchProps('firstName'),
		},
		{
			title: 'Last Name',
			dataIndex: 'lastName',
			...getColumnSearchProps('lastName'),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			...getColumnSearchProps('email'),
		},
		{
			title: 'Graduation Year',
			dataIndex: 'graduationYear',
			filters: [
				{ text: '2022', value: '2022' },
				{ text: '2023', value: '2023' },
				{ text: '2024', value: '2024' },
				{ text: '2025', value: '2025' },
				{ text: '2026', value: '2026' },
				{ text: 'Other', value: 'Other' },
			],
			filteredValue: filteredInfo.graduationYear || null,
			onFilter: (value: string | number | boolean, record: any): boolean => record.graduationYear === value,
		},
		{
			title: 'School',
			dataIndex: 'school',
			...getColumnSearchProps('school'),
		},
		{
			title: '✈️',
			dataIndex: 'applyTravelReimbursement',
			filters: [{ text: '✈️', value: true }],
			filteredValue: filteredInfo.applyTravelReimbursement || null,
			onFilter: (value: string | number | boolean, record: any): boolean =>
				record.applyTravelReimbursement === value,
			render: (appliedTravel?: boolean) =>
				appliedTravel !== undefined ? <Checkbox checked={appliedTravel} /> : '',
		},
		{
			title: 'Status',
			dataIndex: 'status',
			render: (status?: string) => (status ? <Tag color={(STATUS_COLORS as any)[status]}>{status}</Tag> : ''),
			filters: [
				{ text: 'Accepted', value: 'Accepted' },
				{ text: 'Created', value: 'Created' },
				{ text: 'Rejected', value: 'Rejected' },
				{ text: 'Submitted', value: 'Submitted' },
			],
			filteredValue: filteredInfo.status || null,
			onFilter: (value: string | number | boolean, record: any): boolean => record.status.includes(value),
		},
		{
			title: '',
			render: (text: any, record: any) => (
				<>
					{record.status === 'Confirmed' && <CheckCircleOutlined />}&nbsp;&nbsp;
					{record.status !== 'Created' && <EyeOutlined onClick={() => openModal(record._id)} />}
				</>
			),
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
			<Space style={{ marginBottom: 16, float: 'right' }}>
				<Button onClick={clearFilters}>Clear filters</Button>
			</Space>
			<Table
				style={{ width: '95vw' }}
				dataSource={allApplicantsData}
				columns={newCols}
				onChange={handleChange}></Table>
			{isModalOpen && (
				<Modal
					title="Hacker's Application Form"
					visible={isModalOpen}
					onOk={handleCloseModal}
					onCancel={handleCloseModal}>
					{singleApplicant &&
						Object.entries(singleApplicant)
							.filter(([field, _]) => field in APPLICATION_KEY_MAP)
							.map(createSingleApplicantEntry)}
				</Modal>
			)}
		</>
	);
}
