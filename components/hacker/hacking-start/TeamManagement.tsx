import React, { useState } from 'react';
import { TeamProfile } from '../../../types/client';
import styles from '../../../styles/hacker/Table.module.css';
import { Button, Input, Modal } from 'antd';
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
	const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

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
			window.location.reload();
		} else {
			handleSubmitFailure('Server error. Please contact one of our members for help');
		}
	};

	const handleUpdateTeam = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
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

			// Reset state
			setNewTeamName('');
		} else {
			handleSubmitFailure('Server error. Please contact one of our members for help');
		}
	};

	const isDevpostURL = (input: string): boolean => {
		const urlPattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/;
		const devpostPattern = /devpost/i;

		if (urlPattern.test(input) && devpostPattern.test(input)) {
			return true;
		}

		return false;
	};

	const handleUpdateDevpost = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!newDevPost) {
			// Empty team name
			handleSubmitFailure('Devpost link cannot be empty!');
			setShowChangeDevpost(false);
			return;
		}

		if (!isDevpostURL(newDevPost)) {
			// Valid Devpost URL
			handleSubmitFailure('Devpost link is invalid');
			setShowChangeDevpost(false);
			return;
		}

		const endpoint = '/api/team-update';
		const method = 'PATCH';
		const headers = { 'Content-Type': 'application/json' };
		const body = JSON.stringify({ teamName: '', devpost: newDevPost });

		const res = await fetch(endpoint, { method, headers, body });

		if (res.ok) {
			// mutate(endpoint);
			setShowChangeDevpost(false);
			// Update the teamData
			mutate();
			handleSubmitSuccess(`Successfully Changed Devpost Link!`);

			// Reset state
			setNewDevPost('');
		} else {
			handleSubmitFailure('Server error. Please contact one of our members for help');
		}
	};

	const handleLeaveTeam = async () => {
		const endpoint = '/api/team-leave';
		const method = 'PATCH';
		const headers = { 'Content-Type': 'application/json' };

		const res = await fetch(endpoint, { method, headers });

		if (res.ok) {
			handleSubmitSuccess(`You have left the team`);

			// Reset state
			setShowLeaveModal(false);

			window.location.reload();
		} else {
			handleSubmitFailure('Server error. Please contact one of our members for help');
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
								<form onSubmit={event => handleUpdateTeam(event)}>
									<input
										onChange={event => setNewTeamName(event.target.value)}
										type="text"
										className={styles.TeamNameInput}
										defaultValue={teamData.name}></input>
									<button>Submit</button>
									<button onClick={() => setShowRenameTeam(false)}>Cancel</button>
								</form>
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
								<form onSubmit={event => handleUpdateDevpost(event)}>
									<input
										onChange={event => setNewDevPost(event.target.value)}
										type="text"
										className={styles.TeamNameInput}></input>
									<button>Submit</button>
									<button onClick={() => setShowChangeDevpost(false)}>Cancel</button>
								</form>
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
						<button className={styles.TeamButton} onClick={() => setShowLeaveModal(true)}>
							Leave the Team
						</button>
					</div>

					<Modal
						title="Are you sure you want to leave the current team?"
						open={showLeaveModal}
						onOk={handleLeaveTeam}
						onCancel={() => setShowLeaveModal(false)}></Modal>
				</>
			)}
		</div>
	);
};

export default TeamManagement;
