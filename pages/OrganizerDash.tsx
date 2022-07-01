import { Divider, Empty, notification, Skeleton } from 'antd';
import useSWR, { useSWRConfig } from 'swr';
import { ScopedMutator } from 'swr/dist/types';
import AllScores from '../components/allScores';
import ManageRoleForm, { ManageFormFields } from '../components/manageRoleForm';
import OrganizerSchedule from '../components/schedule';
import PreAddForm from '../components/preAddForm';
import { ScheduleDisplay } from '../types/client';
import { ResponseError, ScoreData, TeamData, UserData } from '../types/database';

function handleSubmitSuccess() {
	notification['success']({
		message: `Successfully updated!`,
		placement: 'bottomRight',
	});
}

function handleSubmitFailure(msg: string) {
	notification['error']({
		message: 'Oops woopsy, something went fucky wucky',
		description: msg || 'Please try again or contact an organizer if the problem persists.',
		placement: 'bottomRight',
	});
}

async function handleSubmit(roleData: ManageFormFields, mutate: ScopedMutator<any>) {
	const res = await fetch(`/api/manage-role`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ formData: roleData }),
	});

	if (res.ok) {
		mutate('/api/manage-role');
		handleSubmitSuccess();
	} else handleSubmitFailure(await res.text());
}

export default function OrganizerDash() {
	const { mutate } = useSWRConfig();

	const { data: teamsData, error: teamsError } = useSWR('/api/teams', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of teams.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as TeamData[];
	});

	const { data: scoresData, error: scoresError } = useSWR('/api/scores', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of scores.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as ScoreData[];
	});

	const { data: usersData, error: usersError } = useSWR('/api/users?usertype=JUDGE', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of judges.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as UserData[];
	});

	const { data: scheduleData, error: scheduleError } = useSWR('/api/schedule', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as ScheduleDisplay[];
	});

	const { data: userData, error } = useSWR('/api/manage-role', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of all users.') as ResponseError;
			error.status = res.status;
			throw error;
		}

		return (await res.json()) as { _id: string; name: string; email: string; userType: string }[];
	});

	return (
		<>
			{!scheduleData && <Skeleton />}
			{scheduleData && <OrganizerSchedule data={scheduleData} />}
			<Divider />
			{teamsData && (
				<>
					{/* Add dropdown here w/ functionality */}
					{usersData && scoresData && (
						<AllScores teamData={teamsData} scoreData={scoresData} userData={usersData} />
					)}
				</>
			)}
			{(!teamsData || !usersData || !scoresData) && <Skeleton />}
			<Divider />
			{!userData && <Skeleton />}
			{userData && userData.length == 0 && (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>No users lmao</span>} />
			)}
			{userData && userData.length > 0 && (
				<ManageRoleForm formData={userData} onSubmit={formData => handleSubmit(formData, mutate)} />
			)}
			<Divider />
			<PreAddForm />
		</>
	);
}
