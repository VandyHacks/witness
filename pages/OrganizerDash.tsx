import { Divider, Empty, notification, Skeleton, Space, Tabs } from 'antd';
import useSWR, { useSWRConfig } from 'swr';
import { ScopedMutator } from 'swr/dist/types';
import AllScores from '../components/allScores';
import ManageRoleForm, { ManageFormFields } from '../components/manageRoleForm';
import OrganizerSchedule from '../components/schedule';
import PreAddForm, { PreAddFormFields } from '../components/preAddForm';
import { ScheduleDisplay } from '../types/client';
import { ResponseError, ScoreData, TeamData, UserData, PreAddData } from '../types/database';
import PreAddDisplay from '../components/preAddDisplay';
import { handleSubmitSuccess, handleSubmitFailure } from '../lib/helpers';
import Events from '../components/events';

async function handleManageFormSubmit(roleData: ManageFormFields, mutate: ScopedMutator<any>) {
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

async function handlePreAddDelete(user: PreAddData, mutate: ScopedMutator<any>) {
	console.log('logging user obj', user);
	const res = await fetch('/api/preadd', {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ userId: user._id }),
	});

	if (res.ok) {
		mutate('/api/preadd');
		handleSubmitSuccess(await res.text());
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

	const { data: preAddData, error: Error } = useSWR('/api/preadd', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as PreAddData[];
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
		<Space direction="vertical">
			<Tabs
				defaultActiveKey="1"
				onChange={key => console.log(key)}
				items={[
					{
						label: `Schedule`,
						key: '1',
						children: (
							<>
								{!scheduleData && <Skeleton />}
								{scheduleData && <OrganizerSchedule data={scheduleData} />}
							</>
						),
					},
					{
						label: `Judging`,
						key: '2',
						children: (
							<>
								{!teamsData && <Skeleton />}
								{teamsData && (
									<>
										{/* Add dropdown here w/ functionality */}
										{usersData && scoresData && (
											<AllScores
												teamData={teamsData}
												scoreData={scoresData}
												userData={usersData}
											/>
										)}
									</>
								)}
							</>
						),
					},
					{
						label: `Manage Users`,
						key: '3',
						children: (
							<>
								{!userData && <Skeleton />}
								{userData && userData.length == 0 && (
									<Empty
										image={Empty.PRESENTED_IMAGE_SIMPLE}
										description={<span>No users lmao</span>}
									/>
								)}
								{userData && userData.length > 0 && (
									<ManageRoleForm
										formData={userData}
										onSubmit={formData => handleManageFormSubmit(formData, mutate)}
									/>
								)}
							</>
						),
					},
					{
						label: `Pre-Add Users`,
						key: '4',
						children: (
							<>
								{preAddData && preAddData.length == 0 && (
									<Empty
										image={Empty.PRESENTED_IMAGE_SIMPLE}
										description={<span>No preadded users lmao</span>}
									/>
								)}
								{preAddData && preAddData.length > 0 && (
									<PreAddDisplay
										data={preAddData!}
										onDelete={user => handlePreAddDelete(user, mutate)}
									/>
								)}
								<PreAddForm />
							</>
						),
					},
					{
						label: `Events`,
						key: '5',
						children: <Events />
					}
				]}
			/>

			{/* <Divider />
			{(!teamsData || !usersData || !scoresData || !preAddData) && <Skeleton />}
			<Divider />
			<Divider /> */}
		</Space>
	);
}
