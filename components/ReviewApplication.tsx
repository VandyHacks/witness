import { ApplicationData, ApplicationStatus, UserData } from '../types/database';
import { Space, Table } from 'antd';

export interface ApplicationProps {
	data: ApplicationData[];
}

const columns = [
	{
		title: 'First Name',
		dataIndex: 'firstName',
		key: 'firstName',
	},
	{
		title: 'Last Name',
		dataIndex: 'lastName',
		key: 'lastName',
	},
	{
		title: 'Email',
		dataIndex: ['user', 'email'],
		key: 'email',
	},
	{
		title: 'Grad Year',
		dataIndex: 'graduationYear',
		key: 'grad year',
	},
	{
		title: 'School',
		dataIndex: 'school',
		key: 'school',
	},
	{
		title: 'Status',
		dataIndex: 'status',
		key: 'user.applicationStatus',
	},
	{
		title: 'Actions',
		key: 'actions',
	},
];

export default function ReviewApplication(props: ApplicationProps) {
	let { data } = props;

	// convert applicationStatus to string for table
	data.forEach(application => {
		application.status = ApplicationStatus[application.user.applicationStatus];
	});

	return (
		<>
			<Table dataSource={data} columns={columns}>
				{/*  */}
			</Table>
		</>
	);
}
