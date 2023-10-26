import React, { useState } from 'react';
import { TeamProfile } from '../../../types/client';
import styles from '../../../styles/hacker/Table.module.css';
import { Button, Input } from 'antd';
import useSWR, { mutate } from 'swr';
import { handleSubmitFailure, handleSubmitSuccess } from '../../../lib/helpers';

const TeamManagement = () => {
	// Team to join
	const [teamName, setTeamName] = useState<string | undefined>(undefined);
	const [joinCode, setTeamCode] = useState<string | undefined>(undefined);
	const [showRenameTeam, setShowRenameTeam] = useState<boolean>(false);
	const [showChangeDevpost, setShowChangeDevpost] = useState<boolean>(false);
	// New team name to update
	const [newTeamName, setNewTeamName] = useState<string | undefined>('');
	const [newDevPost, setNewDevPost] = useState<string>('');

	const {
		data: teamData,
		error: teamError,
		mutate,
	} = useSWR('/api/team', async url => {
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
			// mutate(endpoint);
			handleSubmitSuccess(`Successfully ${action === 'CREATE' ? 'created' : 'joined'} a team!`);
		} else {
			handleSubmitFailure(await res.text());
		}
	};

	const handleUpdateTeam = async () => {
		if (!newTeamName) {
			// Empty team name
			handleSubmitFailure('Team name cannot be empty!');
			setShowRenameTeam(false);
			return;
		}
		const endpoint = '/api/team-update';
		const method = 'PATCH';
		const headers = { 'Content-Type': 'application/json' };
		const body = JSON.stringify({ teamName: newTeamName });

		const res = await fetch(endpoint, { method, headers, body });

		if (res.ok) {
			// mutate(endpoint);
			setShowRenameTeam(false);
			// Update the teamData
			mutate();
			handleSubmitSuccess(`Successfully Changed Team Name!`);
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
					{!showRenameTeam && (
						<>
							<div>Team Name: {teamData.name}</div>
						</>
					)}

					{showRenameTeam && (
						<>
							<div className={styles.TeamNameInputContainer}>
								<span>Team Name:</span>
								<Input
									onPressEnter={handleUpdateTeam}
									onChange={event => setNewTeamName(event.target.value)}
									className={styles.TeamNameInput}
									placeholder="New Team Name"
									defaultValue={teamData.name}
								/>
							</div>
						</>
					)}

					<div>Members: {teamData.members}</div>
					<div>Join Code: {teamData.joinCode}</div>

					{!showChangeDevpost && (
						<>
							<div>Devpost: {teamData.devpost}</div>
						</>
					)}

					{showChangeDevpost && (
						<>
							<div className={styles.TeamNameInputContainer}>
								<span>Devpost:</span>
								<Input
									onPressEnter={handleUpdateTeam}
									onChange={event => setNewTeamName(event.target.value)}
									className={styles.TeamNameInput}
									placeholder="New Devpost Link"
								/>
							</div>
						</>
					)}

					<div className={styles.TeamButtonContainer}>
						{/* TODO: change team name */}
						<button className={styles.TeamButton} onClick={() => setShowRenameTeam(true)}>
							Rename Team
						</button>
						{/* TODO: change devpost */}
						<button className={styles.TeamButton} onClick={() => setShowChangeDevpost(true)}>
							Change Devpost Link
						</button>
						{/* TODO: leave team button */}
						<button className={styles.TeamButton}>Leave the Team</button>
					</div>
				</>
			)}
		</div>
	);
};

export default TeamManagement;
