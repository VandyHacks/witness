import { Button, Card, Col, Divider, Form, Input, notification, Row, Skeleton, Space } from 'antd';
import { useSession, signIn } from 'next-auth/client';
import React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ScopedMutator } from 'swr/dist/types';
import ErrorMessage from '../components/errorMessage';
import Outline from '../components/outline';
import TeamSelect from '../components/teamSelect';
import { ResponseError } from '../types/types';

// TODO: this is just a monolithic file, need to refactor

function handleSubmitFailure(message: string) {
	notification['error']({
		message,
		description: 'Please try again or contact an organizer if the problem persists.',
		placement: 'bottomRight',
	});
}

async function handleSubmit(formData: { teamName: string } | { joinCode: string }, mutate: ScopedMutator<any>) {
	const res = await fetch('/api/team-setup', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	});

	if (res.ok) {
		console.log('Received:', await res.text());
		mutate('/api/team-management');
	} else handleSubmitFailure(await res.text());
}
interface TeamCardProps {
	title: string;
	label: string;
	message: string;
	name: string;
	onSubmit: (value: { teamName: string } | { joinCode: string }) => Promise<void>;
}

function TeamCard(props: TeamCardProps) {
	const { title, message, label, name, onSubmit } = props;
	const layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
	};
	return (
		<Card title={title} type="inner" style={{ maxWidth: '50vw' }}>
			<Form {...layout} labelAlign="left" onFinish={onSubmit}>
				<Form.Item label={label} name={name} rules={[{ required: true, message }]}>
					<Input />
				</Form.Item>
				<Button type="primary" htmlType="submit" className="ant-col-offset-8">
					Submit
				</Button>
			</Form>
		</Card>
	);
}

interface TeamFormData {
	teamName: string;
	devpost: URL;
}
interface TeamManagerProps {
	profile: TeamProfile;
	onSubmit: (value: TeamFormData) => Promise<void>;
	onLeave: () => Promise<void>;
}

function TeamManager(props: TeamManagerProps) {
	// TODO: STYLE THIS!
	const { name, joinCode, devpost, members } = props.profile;
	const { onSubmit, onLeave } = props;
	const layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
	};
	return (
		<Card>
			<ul>
				<li key="name">{name}</li>
				<li key="joinCode">{joinCode}</li>
				<li key="devpost">{devpost}</li>
				<li key="members">{members}</li>
			</ul>
			<Form {...layout} labelAlign="left" onFinish={onSubmit}>
				{/* TODO: validation of team name on server side */}
				<Form.Item
					label="Team name"
					name="teamName"
					rules={[{ required: true, message: 'Enter a unique team name' }]}>
					<Input />
				</Form.Item>
				<Form.Item
					label="Devpost"
					name="teamName"
					rules={[{ required: true, message: 'Enter your Devpost link.' }]}>
					<Input />
				</Form.Item>
				<Button type="primary" htmlType="submit" className="ant-col-offset-8">
					Submit
				</Button>
			</Form>
		</Card>
	);
}

export interface TeamProfile {
	name: string;
	joinCode: string;
	devpost: URL;
	members: string[];
}

function SetUpTeam() {
	const { mutate } = useSWRConfig();
	return (
		<>
			<Row justify="center">
				<Col span={12}>
					<TeamCard
						title="New Team"
						label="Team Name"
						name="teamName"
						message="Please enter a unique team name."
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
						title="Join Team"
						label="Join Code"
						name="joinCode"
						message="Please enter your team's join code."
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
		return (await res.json()) as TeamProfile;
	});

	const [session, loading] = useSession();
	if (!loading && !session) return signIn();
	let pageContent;
	if (teamError) {
		pageContent = teamError.status === 409 ? <SetUpTeam /> : <ErrorMessage status={teamError.status} />;
	} else if (!teamData) pageContent = <Skeleton />;
	else {
		// Team data received.
		pageContent = <TeamManager profile={teamData} onSubmit={() => {}} onLeave={() => {}} />; //<div>{teamData.members}</div>;
	}
	return (
		<Outline selectedKey="team">
			<h1>Team Management</h1>
			{pageContent}
		</Outline>
	);
}
