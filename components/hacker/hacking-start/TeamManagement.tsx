import React, { useState } from 'react';
import { TeamProfile } from '../../../types/client';
import styles from '../../../styles/hacker/Table.module.css';
import { Button, Form, Input } from 'antd';

const TeamManagement = ({ teamData }: { teamData: TeamProfile | undefined }) => {
	const [teamName, setTeamName] = useState<string | undefined>(undefined);
	const [teamCode, setTeamCode] = useState<string | undefined>(undefined);

	// TODO:
	// 1. User has no team:
	// -- "You have not joined a team yet"
	// -- join team / create team
	// -- enter join code here

	const handleCreateTeam = () => {
		// TODO:
		// update endpoint to not require devpost
		// ensure no team name conflicts
		console.log('Create Team', teamName);
		alert('Create team' + teamName);
	};

	const handleJoinTeam = () => {
		// TODO:
		console.log('Join Team', teamCode);
		alert('Join team' + teamCode);
	};

	// 2. User has team:
	// -- Your team name
	// -- Join code: <code>
	// -- Members listed
	// -- devpost link
	// -- button to rename team and change devpost

	return (
		<>
			{/* TODO: not done yet lol */}
			{teamData !== undefined && (
				<div className={styles.Container}>
					Team
					<div className={styles.Placeholder}>You are not in a team yet.</div>
					<div className={styles.TeamActionContainer}>
						<div>
							<div>Create a Team</div>
							<div className={styles.TeamInput}>
								<Input placeholder="Enter Team Name" onChange={e => setTeamName(e.target.value)} />
								<Button htmlType="submit" onClick={handleCreateTeam}>
									Create Team
								</Button>
							</div>
						</div>

						<div>Or</div>

						<div>
							<div>Join a Team</div>
							<div className={styles.TeamInput}>
								<Input placeholder="Enter Team Code" onChange={e => setTeamCode(e.target.value)} />
								<Button htmlType="submit" onClick={handleJoinTeam}>
									Create Team
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default TeamManagement;
