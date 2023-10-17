import React from 'react';
import { TeamProfile } from '../../../types/client';
import styles from '../../../styles/hacker/Table.module.css';
import { Button, Form, Input } from 'antd';

const TeamManagement = ({ teamData }: { teamData: TeamProfile | undefined }) => {
	// TODO:
	// 1. User has no team:
	// -- "You have not joined a team yet"
	// -- join team / create team
	// -- enter join code here

	const handleCreateTeam = (values: any) => {
		// TODO:
		console.log('Create Team', values);
	};

	const handleJoinTeam = (values: any) => {
		// TODO:
		console.log('Join Team', values);
	};

	// 2. User has team:
	// -- Your team name
	// -- Join code: <code>
	// -- Members listed
	// -- devpost link
	// -- button to rename team and change devpost

	return (
		<div>
			{/* TODO: not done yet lol */}
			{teamData === undefined && (
				<div className={styles.Container}>
					<div>You have not joined a team yet</div>
					<div>
						<div>Option 1: Create a team</div>

						{/* Create Team */}
						<Form onFinish={handleCreateTeam}>
							<Form.Item
								name="teamName"
								rules={[
									{
										required: true,
										message: 'Please enter a team name!                            ',
									},
								]}>
								<Input placeholder="Enter Team Name" />
							</Form.Item>
							<Form.Item
								name="devpost"
								rules={[
									{
										required: true,
										message: 'Please enter a valid Devpost Link (https://devpost.com/...)',
										pattern: new RegExp('^https://devpost.com/.*'),
									},
								]}>
								<Input placeholder="Enter Devpost Link" />
							</Form.Item>

							{/* Button */}
							<Button htmlType="submit">Create Team</Button>
						</Form>
					</div>
					<div>
						<div>Option 2: Join a team</div>

						{/* Join Code */}
						<Form onFinish={handleJoinTeam}>
							<Form.Item
								name="joinCode"
								rules={[
									{
										required: true,
										message: 'Please enter a join code!                            ',
									},
								]}>
								<Input placeholder="Enter Join Code Here" />
							</Form.Item>

							{/* Join Team */}
							<Button htmlType="submit">Join Team</Button>
						</Form>
					</div>
				</div>
			)}

			{teamData && <div>Your team name is: {teamData.name}</div>}
		</div>
	);
};

export default TeamManagement;
