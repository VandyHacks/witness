import { Button, Collapse, Descriptions, Divider, Form, Input, notification, Tag } from 'antd';
import { useSWRConfig } from 'swr';
import { ScopedMutator } from 'swr/dist/types';
import { handleSubmitFailure } from '../lib/helpers';
import { TeamProfile } from '../types/client';
import LeaveButton from './LeaveButton';
const { Panel } = Collapse;

async function handleSubmit(formData: { teamName: string } | { devpost: string }, mutate: ScopedMutator<any>) {
	const res = await fetch('/api/team-management', {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	});

	if (res.ok) {
		console.log('Received:', await res.text());
		mutate('/api/team-management');
		return true;
	} else handleSubmitFailure(await res.text());
	return false;
}

async function handleLeaveTeam(mutate: ScopedMutator<any>) {
	const res = await fetch('/api/team-management', {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (res.ok) {
		console.log('Received:', await res.text());
		mutate('/api/team-management');
	} else handleSubmitFailure(await res.text());
}

export default function TeamManager({ profile }: { profile: TeamProfile }) {
	// TODO: STYLE THIS!
	const { name, joinCode, devpost, members } = profile;
	const onFormFinish = async (data: { teamName: string } | { devpost: string }, mutate: ScopedMutator<any>) => {
		const success = await handleSubmit(data, mutate);
		if (success) {
			notification['success']({
				message: <span>Successfully Changed!</span>,
				placement: 'bottomRight',
			});
		}
	};
	const { mutate } = useSWRConfig();
	const layout = {
		labelCol: { span: 4 },
		wrapperCol: { span: 20 },
	};
	return (
		<>
			<Descriptions bordered>
				<Descriptions.Item label="Team Name" span={24}>
					{name}
				</Descriptions.Item>
				<Descriptions.Item label="Join Code" span={24}>
					<Tag>{joinCode}</Tag>
				</Descriptions.Item>
				<Descriptions.Item label="Devpost" span={24}>
					<a style={{ color: '#1890ff' }} href={devpost.toString()} target="_blank" rel="noreferrer">
						{devpost}
					</a>
				</Descriptions.Item>
				{/* <Descriptions.Item label="Members">empty</Descriptions.Item> */}
				<Descriptions.Item label="Members">
					{members.map((member, i) => (
						<Tag key={i} color="blue">
							{member}
						</Tag>
					))}
				</Descriptions.Item>
			</Descriptions>
			{/* TODO: validation of team name on server side */}
			<Divider />
			<Collapse accordion>
				<Panel header="Change Team Name" key="1">
					<Form {...layout} labelAlign="left" onFinish={formData => onFormFinish(formData, mutate)}>
						<Form.Item
							name="teamName"
							label="New Team Name"
							rules={[{ required: true, message: 'Please enter a team name.' }]}>
							<Input />
						</Form.Item>
						<Button type="primary" htmlType="submit" className="ant-col-offset-4">
							Submit
						</Button>
					</Form>
				</Panel>
				<Panel header="Change Devpost" key="2">
					<Form {...layout} labelAlign="left" onFinish={formData => onFormFinish(formData, mutate)}>
						<Form.Item
							name="devpost"
							label="New Devpost URL"
							rules={[{ required: true, message: 'Please enter a Devpost URL.' }]}>
							<Input />
						</Form.Item>
						<Button type="primary" htmlType="submit" className="ant-col-offset-4">
							Submit
						</Button>
					</Form>
				</Panel>
			</Collapse>
			<Divider />
			<LeaveButton onLeave={handleLeaveTeam} />
		</>
	);
}
