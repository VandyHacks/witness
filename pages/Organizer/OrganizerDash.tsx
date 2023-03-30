import { Button, Divider, Empty, Skeleton, Space, Tabs } from 'antd';
import useSWR, { useSWRConfig } from 'swr';
import AllScores from '../../components/allScores';
import ManageRoleForm from '../../components/manageRoleForm';
import OrganizerSchedule from '../../components/schedule';
import PreAddForm from '../../components/preAddForm';
import { ResponseError, ScoreData, TeamData, UserData, PreAddData, JudgingSessionData } from '../../types/database';
import PreAddDisplay from '../../components/preAddDisplay';
import ApplicantsDisplay from '../../components/applicantsDisplay';
import Events from '../../components/events';
import { signOut, useSession } from 'next-auth/react';
import { SetStateAction, useEffect, useState } from 'react';
import Title from 'antd/lib/typography/Title';
import {
	generateScheduleA,
	generateScheduleB,
	handleManageFormSubmit,
	handlePreAddDelete,
	TIMES_JUDGED,
} from '../../utils/organizer-utils';

export default function OrganizerDash() {
	const { mutate } = useSWRConfig();

	// Get teams data from API
	const { data: teamsData, error: teamsError } = useSWR('/api/teams', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of teams.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as TeamData[];
	});

	// Get scores data from API
	const { data: scoresData, error: scoresError } = useSWR('/api/scores', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of scores.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as ScoreData[];
	});

	// Get judges data from API
	const { data: judgeData, error: judgeError } = useSWR('/api/users?usertype=JUDGE', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of judges.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as UserData[];
	});

	// Get hackers data from API
	const { data: hackers, error: hackersError } = useSWR('/api/users?usertype=HACKER', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of hackers.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as UserData[];
	});

	/*const { data: scheduleData, error: scheduleError } = useSWR('/api/schedule', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as ScheduleDisplay[];
	});*/

	// Get judging sessions data from API
	const { data: judgingSessionsData, error: judgingSessionsDataError } = useSWR(
		'/api/judging-sessions',
		async url => {
			const res = await fetch(url, { method: 'GET' });
			if (!res.ok) {
				const error = new Error('Failed to get judging sessions') as ResponseError;
				error.status = res.status;
				throw error;
			}
			return (await res.json()) as JudgingSessionData[];
		}
	);

	// Get preadd data from API
	const { data: preAddData, error: Error } = useSWR('/api/preadd', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as PreAddData[];
	});

	// Get all users roles from API
	const { data: userData, error } = useSWR('/api/manage-role', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of all users.') as ResponseError;
			error.status = res.status;
			throw error;
		}

		return (await res.json()) as { _id: string; name: string; email: string; userType: string }[];
	});

	useEffect(() => {
		// Exit early if we don't have data yet
		if (!judgingSessionsData) return;

		// Sort judging sessions by time
		const time = new Date('2022-10-23T11:00:00').getTime();
		const sampleScheduleA = judgingSessionsData.filter(
			judgingSession => new Date(judgingSession.time as string).getTime() < time
		);
		const sampleScheduleB = judgingSessionsData.filter(
			judgingSession => new Date(judgingSession.time as string).getTime() >= time
		);

		// Set the data
		setSampleScheduleA(sampleScheduleA);
		setSampleScheduleB(sampleScheduleB);
	}, [judgingSessionsData]);

	// Check if schedule is impossible
	const isScheduleImpossible = () =>
		teamsData && judgeData && (teamsData.length * TIMES_JUDGED) / 12 > judgeData.length;

	// Get session data
	const { data: session, status } = useSession();

	// React state
	const [testingSchedule, setTestingSchedule] = useState(false);
	const [sampleScheduleAData, setSampleScheduleA] = useState<JudgingSessionData[] | undefined>(undefined);
	const [sampleScheduleBData, setSampleScheduleB] = useState<JudgingSessionData[] | undefined>(undefined);

	function handleConfirmSchedule(arg0: JudgingSessionData[]) {
		throw new Error('Function not implemented.');
	}

	return (
		<>
			<div style={{ display: 'flex' }}>
				<Button size="small" type="default" onClick={() => signOut()}>
					Sign out
				</Button>
				<div style={{ paddingLeft: '10px' }}>Signed in as {session?.user?.email}</div>
			</div>
			<Space direction="vertical">
				<Tabs
					defaultActiveKey="1"
					items={[
						{
							label: `Schedule`,
							key: '1',
							children: (
								<>
									{teamsData &&
										judgeData &&
										(testingSchedule ? (
											<Button
												onClick={() => {
													handleConfirmSchedule(sampleScheduleAData!);
													handleConfirmSchedule(sampleScheduleBData!);
													setTestingSchedule(false);
												}}
												style={{ marginBottom: '10px' }}>
												Confirm Schedule
											</Button>
										) : (
											<Button
												onClick={() => {
													if (
														!window.confirm(
															'Are you sure you want to create a new schedule?'
														)
													)
														return;
													setTestingSchedule(true);
													setSampleScheduleA(generateScheduleA(teamsData, judgeData));
													setSampleScheduleB(generateScheduleB(teamsData, judgeData));
												}}
												style={{ marginBottom: '10px' }}>
												Create Sample Judging Schedule
											</Button>
										))}
									{!judgingSessionsData && <Skeleton />}
									<br />

									<>
										{isScheduleImpossible() ? (
											<div>oops woopsy, something went fucky wucky</div>
										) : (
											<div>schedule is possible!!</div>
										)}
										<div>Count of Teams: {teamsData?.length}</div>
										<div>Count of Judges: {judgeData?.length}</div>
									</>

									{<Title>Expo A</Title>}
									{sampleScheduleAData && (
										<OrganizerSchedule
											data={sampleScheduleAData}
											handleChange={function (value: SetStateAction<string>): void {
												throw new Error('Function not implemented.');
											}}
											sessionTimeStart={new Date('2022-10-23T10:00:00')}
											sessionTimeEnd={new Date('2022-10-23T11:00:00')}
										/>
									)}
									<div style={{ height: '20px' }} />
									{<Title>Expo B</Title>}
									{sampleScheduleBData && (
										<OrganizerSchedule
											data={sampleScheduleBData}
											handleChange={function (value: SetStateAction<string>): void {
												throw new Error('Function not implemented.');
											}}
											sessionTimeStart={new Date('2022-10-23T11:30:00')}
											sessionTimeEnd={new Date('2022-10-23T12:30:00')}
										/>
									)}
									<Divider />
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
											{judgeData && scoresData && (
												<AllScores
													teamData={teamsData}
													scoreData={scoresData}
													userData={judgeData}
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
							label: `Manage Applications`,
							key: '5',
							children: <>{hackers && <ApplicantsDisplay hackers={hackers} />}</>,
						},
						{
							label: `Events`,
							key: '6',
							children: <Events />,
						},
					]}
				/>
			</Space>
		</>
	);
}
