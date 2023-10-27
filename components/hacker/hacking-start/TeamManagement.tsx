import React, { useState } from 'react';
import { TeamProfile } from '../../../types/client';
import styles from '../../../styles/hacker/Table.module.css';
import { Button, Input, Modal } from 'antd';
import useSWR, { mutate } from 'swr';
import { handleSubmitFailure, handleSubmitSuccess } from '../../../lib/helpers';

const isDevpostURL = (input: string): boolean => {
	if (!input) return false;

	return input.startsWith('https://devpost.com/') || input.startsWith('http://www.devpost.com/');
};

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
	const [showRenameTeamModal, setShowRenameTeamModal] = useState<boolean>(false);

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
			handleSubmitFailure('There was an error. Are you sure the team is not filled up already?');
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
		const message = await res.text();

		if (res.ok) {
			// mutate(endpoint);
			setShowRenameTeam(false);
			// Update the teamData
			mutate();
			handleSubmitSuccess(`Successfully Changed Team Name!`);

			// Reset state
			setNewTeamName('');
		} else {
			// handle submit failure the resupose message
			handleSubmitFailure(message);
		}
	};

	const handleUpdateDevpost = async () => {
		if (!newDevPost) {
			// Empty team name
			handleSubmitFailure('Devpost link cannot be empty!');
			setShowChangeDevpost(false);
			return;
		}

		if (!isDevpostURL(newDevPost)) {
			// Valid Devpost URL
			handleSubmitFailure(
				'Devpost link is invalid. Must start with https://devpost.com/ or https://www.devpost.com/'
			);
			setShowChangeDevpost(false);
			return;
		}

		const endpoint = '/api/team-update';
		const method = 'PATCH';
		const headers = { 'Content-Type': 'application/json' };
		const body = JSON.stringify({ teamName: '', devpost: newDevPost });

		const res = await fetch(endpoint, { method, headers, body });
		const message = await res.text();

		if (res.ok) {
			// mutate(endpoint);
			setShowChangeDevpost(false);
			// Update the teamData
			mutate();
			handleSubmitSuccess(`Successfully Changed Devpost Link!`);

			// Reset state
			setNewDevPost('');
		} else {
			handleSubmitFailure(message);
		}
	};

	const handleLeaveTeam = async () => {
		const endpoint = '/api/team-leave';
		const method = 'PATCH';
		const headers = { 'Content-Type': 'application/json' };

		const res = await fetch(endpoint, { method, headers });
		const message = await res.text();

		if (res.ok) {
			handleSubmitSuccess(`You have left the team`);

			// Reset state
			setShowLeaveModal(false);

			window.location.reload();
		} else {
			handleSubmitFailure(message);
		}
	};

	return (
		<div className={styles.Container}>
			Team
			<div className={styles.Description}>
				You can create a team or join a team (1 - 4 people per team). Devpost link must be submitted by 12:30 PM
				on October 29th.
			</div>
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
					<div className={styles.TeamContainer}>
						<div className={styles.TeamRow}>
							<div className={styles.TeamRowLabel}>Team Name:</div>
							<div className={styles.TeamRowValue}>{teamData.name}</div>
						</div>
						<div className={styles.TeamRow}>
							<div className={styles.TeamRowLabel}>Members:</div>
							<div className={styles.TeamRowValue}>{teamData.members}</div>
						</div>
						<div className={styles.TeamRow}>
							<div className={styles.TeamRowLabel}>Join Code:</div>
							<div className={styles.TeamRowValue}>{teamData.joinCode}</div>
						</div>
						<div className={styles.TeamRow}>
							<div className={styles.TeamRowLabel}>Devpost:</div>
							<div className={styles.TeamRowValue}>{teamData.devpost}</div>
						</div>
					</div>

					<div className={styles.TeamButtonContainer}>
						<Button htmlType="submit" onClick={() => setShowRenameTeam(true)}>
							Rename Team
						</Button>
						<Button htmlType="submit" onClick={() => setShowChangeDevpost(true)}>
							Change Devpost Link
						</Button>
						<Button htmlType="submit" onClick={() => setShowLeaveModal(true)}>
							Leave the Team
						</Button>
					</div>

					<Modal
						title="Rename Team"
						open={showRenameTeam}
						onCancel={() => setShowRenameTeam(false)}
						onOk={handleUpdateTeam}
						destroyOnClose={true}>
						<Input onChange={event => setNewTeamName(event.target.value)} defaultValue={teamData.name} />
					</Modal>

					<Modal
						title="Change Devpost Link"
						open={showChangeDevpost}
						onCancel={() => setShowChangeDevpost(false)}
						onOk={handleUpdateDevpost}
						destroyOnClose={true}>
						<Input
							onChange={event => setNewDevPost(event.target.value)}
							defaultValue={teamData.devpost.toString()}
						/>
					</Modal>

					<Modal
						title="Are you sure you want to leave the current team?"
						open={showLeaveModal}
						onOk={handleLeaveTeam}
						onCancel={() => setShowLeaveModal(false)}
					/>
				</>
			)}
		</div>
	);
};

export default TeamManagement;
