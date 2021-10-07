import { Button, Card, Col, Divider, Form, Input, notification, Row, Space } from 'antd';
import React from 'react';
import { useSWRConfig } from 'swr';
import { ScopedMutator } from 'swr/dist/types';
import Outline from '../components/outline';
import TeamSelect from '../components/teamSelect';

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

function handleSubmitFailure(message: string) {
	notification['error']({
		message,
		description: 'Please try again or contact an organizer if the problem persists.',
		placement: 'bottomRight',
	});
}

async function handleSubmit(formData: { teamName: string } | { joinCode: string }, mutate: ScopedMutator<any>) {
	const res = await fetch('/api/team-management', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	});

	if (res.ok) mutate('/api/team-management');
	else handleSubmitFailure(await res.text());
}

export default function Team() {
	const { mutate } = useSWRConfig();
	return (
		<Outline selectedKey="dashboard">
			<h1>Team Management</h1>
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
		</Outline>
	);
}
