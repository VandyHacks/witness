import {
	Button,
	Card,
	Col,
	Collapse,
	Descriptions,
	Divider,
	Form,
	Input,
	notification,
	Popconfirm,
	Row,
	Skeleton,
	Space,
	Tag,
} from 'antd';
import { useSession, signIn } from 'next-auth/client';
import React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ScopedMutator } from 'swr/dist/types';
import ErrorMessage from '../components/errorMessage';
import Outline from '../components/outline';
import TeamSelect from '../components/teamSelect';
import team from '../models/team';
import { ResponseError } from '../types/database';
const { Panel } = Collapse;

// TODO: this is just a monolithic file, need to refactor

function handleRequestFailure(message: string) {
	notification['error']({
		message,
		description: 'Please try again or contact an organizer if the problem persists.',
		placement: 'bottomRight',
	});
}

interface NewTeamFields {
	teamName: string;
	devpost: string;
}

async function handleSetupSubmit(formData: NewTeamFields | { joinCode: string }, mutate: ScopedMutator<any>) {
	const res = await fetch('/api/team-management', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	});

	if (res.ok) {
		console.log('Received:', await res.text());
		mutate('/api/team-management');
	} else handleRequestFailure(await res.text());
}
interface TeamCardProps {
	title: string;
	fields: { name: string; label: string }[];
	submitText: string;
	onSubmit: (value: NewTeamFields | { joinCode: string }) => Promise<void>;
}

function TeamCard(props: TeamCardProps) {
	const { title, fields, submitText, onSubmit } = props;
	const layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
	};
	return (
		<Card title={title} type="inner" style={{ maxWidth: '50vw' }}>
			<Form {...layout} labelAlign="left" onFinish={onSubmit}>
				{fields.map(field => (
					<Form.Item
						key={field.label}
						label={field.label}
						name={field.name}
						rules={[{ required: true, message: 'This field is required.' }]}>
						<Input />
					</Form.Item>
				))}
				<Button type="primary" htmlType="submit" className="ant-col-offset-8">
					{ submitText }
				</Button>
			</Form>
		</Card>
	);
}

async function handleEditSubmit(formData: { teamName: string } | { devpost: string }, mutate: ScopedMutator<any>) {
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
	} else handleRequestFailure(await res.text());
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
	} else handleRequestFailure(await res.text());
}

function LeaveButton({ onLeave }: { onLeave: (mutate: ScopedMutator<any>) => Promise<void> }) {
	const { mutate } = useSWRConfig();
	return (
		<Popconfirm
			title="Are you sure?"
			placement="right"
			okText="Yes"
			cancelText="No"
			onConfirm={() => onLeave(mutate)}>
			<Button type="primary" danger>
				Leave Team
			</Button>
		</Popconfirm>
	);
}

interface TeamManagerProps {
	profile: TeamProfile;
	handleSubmit: (data: { teamName: string } | { devpost: string }, mutate: ScopedMutator<any>) => Promise<boolean>;
	onLeave: (mutate: ScopedMutator<any>) => Promise<void>;
}

function TeamManager(props: TeamManagerProps) {
	// TODO: STYLE THIS!
	const { name, joinCode, devpost, members } = props.profile;
	const { handleSubmit, onLeave } = props;
	const onFormFinish = async (data: { teamName: string } | { devpost: string }, mutate: ScopedMutator<any>) => {
		const success = await handleSubmit(data, mutate);
		if (success) {
			notification['success']({
				message: (
					<span>
						Successfully Changed!
					</span>
				),
				placement: 'bottomRight',
			});
		}
	}
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
					{joinCode}
				</Descriptions.Item>
				<Descriptions.Item label="Devpost" span={24}>
					{devpost}
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
			<LeaveButton onLeave={onLeave} />
		</>
	);
}

export interface TeamProfile {
	name: string;
	joinCode: string;
	devpost: URL;
	members: string[];
}
interface TeamSetupProps {
	handleSubmit: (formData: NewTeamFields | { joinCode: string }, mutate: ScopedMutator<any>) => Promise<void>;
}

function TeamSetup({ handleSubmit }: TeamSetupProps) {
	const { mutate } = useSWRConfig();
	return (
		<>
			<Row justify="center">
				<Col span={12}>
					<TeamCard
						title="Create a New Team"
						fields={[
							{ name: 'teamName', label: 'Team Name' },
							{ name: 'devpost', label: 'Devpost' },
						]}
						submitText='Create Team'
						onSubmit={formData => handleSubmit(formData, mutate)}
					/>
				</Col>
			</Row>
			<Row justify="center">
				<Col span={12}>
					<Divider>Or</Divider>
				</Col>
			</Row>
			<Row justify="center">
				<Col span={12}>
					<TeamCard
						title="Join an Existing Team"
						fields={[{ name: 'joinCode', label: 'Join Code' }]}
						submitText='Join Team'
						onSubmit={formData => handleSubmit(formData, mutate)}
					/>
				</Col>
			</Row>
		</>
	);
}

export default function Team() {
	const { data: teamData, error: teamError } = useSWR('/api/team-management', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get team.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		const { members, ...rest } = await res.json();

		return { members: members.map((member: any) => member.name), ...rest } as TeamProfile;
	});

	const [session, loading] = useSession();
	if (!loading && !session) return signIn();
	let pageContent;
	if (teamError) {
		pageContent =
			teamError.status === 409 ? (
				<TeamSetup handleSubmit={handleSetupSubmit} />
			) : (
				<ErrorMessage status={teamError.status} />
			);
	} else if (!teamData) pageContent = <Skeleton />;
	else {
		// Team data received.
		pageContent = <TeamManager profile={teamData} handleSubmit={handleEditSubmit} onLeave={handleLeaveTeam} />; //<div>{teamData.members}</div>;
	}
	return (
		<Outline selectedKey="team">
			<h1>Team Management</h1>
			{pageContent}
		</Outline>
	);
}
