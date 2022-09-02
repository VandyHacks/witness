import { Button, Form, Input, Skeleton } from 'antd';
import useSWR from 'swr';
import TeamManager from '../components/TeamManager';
import TeamSetup from '../components/TeamSetup';
import { TeamProfile } from '../types/client';
import { ApplicationStatus, UserData } from '../types/database';

export default function HackerDash() {
	const { data: teamData, error: teamError } = useSWR('/api/team-management', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) return;
		const { members, ...rest } = await res.json();

		return { members: members.map((member: any) => member.name), ...rest } as TeamProfile;
	});

	const { data: user } = useSWR('/api/user-data', async url => {
		const res = await fetch(url, { method: 'GET' });
		return (await res.json()) as UserData;
	});

	const onFinish = async (values: any) => {
		await fetch('/api/apply', {
			method: "POST",
			body: JSON.stringify(values),
		});
		window.location.reload();
	}

	return (
		<>
			{!user && <Skeleton />}
			{user && (
				<>
					{user.applicationStatus === ApplicationStatus.CREATED && (
						<Form 
							labelCol={{ span: 3 }} 
							wrapperCol={{ span: 12 }}
							onFinish={onFinish}
						>
							<Form.Item
								label="First Name"
								name="firstName"
								rules={[{ required: true, message: 'Please input your first name!' }]}>
								<Input />
							</Form.Item>
							<Form.Item
								label="Last Name"
								name="lastName"
								rules={[{ required: true, message: 'Please input your last name!' }]}>
								<Input />
							</Form.Item>
							<Form.Item label="Preferred Name" name="preferredName">
								<Input />
							</Form.Item>
							<Form.Item
								label="Phone Number"
								name="phoneNumber"
								rules={[{ required: true, message: 'Please input your phone number!' }]}>
								<Input />
							</Form.Item>
							<Form.Item>
								<Button type="primary" htmlType="submit">
									Submit
								</Button>
							</Form.Item>
						</Form>
					)}
					{user.applicationStatus === ApplicationStatus.ACCEPTED && (
						<>
							{!teamData && <TeamSetup />}
							{teamData && <TeamManager profile={teamData} />}
						</>
					)}
				</>
			)}
		</>
	);
}
