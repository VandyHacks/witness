import React, { useState } from 'react';
import { TeamProfile } from '../../../types/client';
import styles from '../../../styles/hacker/Table.module.css';
import { Button, Input } from 'antd';
import useSWR, { mutate } from 'swr';
import { handleSubmitFailure, handleSubmitSuccess } from '../../../lib/helpers';

const TeamManagement = () => {
	const [teamName, setTeamName] = useState<string | undefined>(undefined);
	const [joinCode, setTeamCode] = useState<string | undefined>(undefined);

	const { data: teamData, error: teamError } = useSWR('/api/team', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) return;
		const { members, ...rest } = await res.json();

		return { members: members.map((member: any) => member.name), ...rest } as TeamProfile;
	});

	// handle create/join team
	const handleAction = async (action: 'CREATE' | 'JOIN') => {
		const endpoint = action === 'CREATE' ? '/api/team-create' : '/api/team-join';
		const method = action === 'CREATE' ? 'POST' : 'PATCH';
		const headers = { 'Content-Type': 'application/json' };
		const body = JSON.stringify(action === 'CREATE' ? { teamName } : { joinCode });

		const res = await fetch(endpoint, { method, headers, body });

		if (res.ok) {
			mutate(endpoint);
			handleSubmitSuccess(`Successfully ${action === 'CREATE' ? 'created' : 'joined'} a team!`);
		} else {
			handleSubmitFailure(await res.text());
		}
	};

	return (
		<div className={styles.Container}>
			{/* TODO: not done yet lol */}
			Team
			{!teamData && (
				<>
					<div className={styles.Placeholder}>You are not in a team yet.</div>
					<div className={styles.TeamActionContainer}>
						<div>
							<div>Create a Team</div>
							<div className={styles.TeamInput}>
								<Input placeholder="Enter Team Name" onChange={e => setTeamName(e.target.value)} />
								<Button htmlType="submit" onClick={() => handleAction('CREATE')}>
									Create Team
								</Button>
							</div>
						</div>

						<div>Or</div>

						<div>
							<div>Join a Team</div>
							<div className={styles.TeamInput}>
								<Input placeholder="Enter Team Code" onChange={e => setTeamCode(e.target.value)} />
								<Button htmlType="submit" onClick={() => handleAction('JOIN')}>
									Join Team
								</Button>
							</div>
						</div>
					</div>
				</>
			)}
			{teamData && (
				<>
					<div>Team Name: {teamData.name}</div>
					<div>Members: {teamData.members}</div>
					<div>Join Code: {teamData.joinCode}</div>
					<div>Devpost: {teamData.devpost}</div>
					<div className={styles.TeamButtonContainer}>
						{/* TODO: change team name */}
						<button className={styles.TeamButton}>Rename Team</button>
						{/* TODO: change devpost */}
						<button className={styles.TeamButton}>Change Devpost</button>
						{/* TODO: leave team button */}
						<button className={styles.TeamButton}>Leave the Team</button>
					</div>
				</>
			)}
		</div>
	);
};

export default TeamManagement;
