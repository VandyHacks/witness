import { Button, Divider, Empty, Skeleton, Space, Tabs } from 'antd';
import useSWR, { useSWRConfig } from 'swr';
import { ScopedMutator } from 'swr/dist/types';
import AllScores from '../components/allScores';
import ManageRoleForm, { ManageFormFields } from '../components/manageRoleForm';
import OrganizerSchedule from '../components/schedule';
import PreAddForm, { PreAddFormFields } from '../components/preAddForm';
import { ScheduleDisplay } from '../types/client';
import {
	ResponseError,
	ScoreData,
	TeamData,
	UserData,
	PreAddData,
	ApplicationData,
	JudgingSessionData,
} from '../types/database';
import PreAddDisplay from '../components/preAddDisplay';
import ApplicantsDisplay from '../components/applicantsDisplay';
import { handleSubmitSuccess, handleSubmitFailure } from '../lib/helpers';
import Events from '../components/events';
import styles from '../styles/Form.module.css';
import { signOut, useSession } from 'next-auth/react';
import { generateTimes } from '../components/schedule';
import { SetStateAction, useEffect, useState } from 'react';
import Title from 'antd/lib/typography/Title';
import { ConsoleSqlOutlined } from '@ant-design/icons';

const TIMES_JUDGED = 3;

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

function matchTeams(teams: TeamData[], judges: UserData[], times: Date[]) {
	let sessions = [];

	const numSessions = TIMES_JUDGED * teams.length;

	const perTimes = Math.floor(numSessions / times.length);
	let remTimes = numSessions % times.length;

	let teamIdx = 0;
	let judgeIdx = 0;

	for (let i = 0; i < times.length; i++) {
		const currSessions = perTimes + (remTimes > 0 ? 1 : 0);
		remTimes--;
		for (let j = 0; j < currSessions; j++) {
			sessions.push({
				team: teams[teamIdx],
				judge: judges[judgeIdx],
				time: times[i].toISOString() as String,
			});
			teamIdx = (teamIdx + 1) % teams.length;
			judgeIdx = (judgeIdx + 1) % judges.length;
		}
	}

	return sessions;
}

function generateScheduleA(teams: TeamData[], judges: UserData[]) {
	const numTeams = teams.length;
	const teamsPerSession = Math.floor(numTeams / 2);
	const timesOne = generateTimes(new Date('2022-10-23T10:00:00'), new Date('2022-10-23T11:00:00'), 10);
	const sessionsA = matchTeams(teams.slice(0, teamsPerSession), judges, timesOne);
	return sessionsA;
}

function generateScheduleB(teams: TeamData[], judges: UserData[]) {
	const numTeams = teams.length;
	const teamsPerSession = Math.floor(numTeams / 2);
	const timesTwo = generateTimes(new Date('2022-10-23T11:30:00'), new Date('2022-10-23T12:30:00'), 10);
	const sessionsB = matchTeams(teams.slice(teamsPerSession, numTeams), judges, timesTwo);
	return sessionsB;
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

	const { data: judgeData, error: judgeError } = useSWR('/api/users?usertype=JUDGE', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of judges.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as UserData[];
	});

	const { data: hackers, error: hackersError } = useSWR('/api/users?usertype=HACKER', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of hackers.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as UserData[];
	});

	const { data: testhackers, error: testhackersError } = useSWR('/api/judge-notice?usertype=HACKER', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as ScheduleDisplay[];
	});

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

	const handleConfirmSchedule = async (judgingSessions: JudgingSessionData[]) => {
		const res = await fetch('/api/confirm-judging-sessions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				newJudgingSessions: judgingSessions,
			}),
		});

		if (res.ok) {
			handleSubmitSuccess(await res.text());
		} else handleSubmitFailure(await res.text());
	};


	const sendJudgeScheduleEmailReminder = () => {
		hackers?.forEach(hacker => {
			fetch('/api/judge-notice', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ hacker }),
			});
		});
	};

	useEffect(() => {
		if (!judgingSessionsData) return;
		const time = new Date('2022-10-23T11:00:00').getTime();
		const sampleScheduleA = judgingSessionsData.filter(
			judgingSession => new Date(judgingSession.time as string).getTime() < time
		);
		const sampleScheduleB = judgingSessionsData.filter(
			judgingSession => new Date(judgingSession.time as string).getTime() >= time
		);
		// console.log(sampleScheduleA);
		// console.log(sampleScheduleB);
		setSampleScheduleA(sampleScheduleA);
		setSampleScheduleB(sampleScheduleB);
	}, [judgingSessionsData]);

	const isScheduleImpossible = () =>
		teamsData && judgeData && (teamsData.length * TIMES_JUDGED) / 12 > judgeData.length;

	const { data: session, status } = useSession();

	const [testingSchedule, setTestingSchedule] = useState(false);
	const [sampleScheduleAData, setSampleScheduleA] = useState<JudgingSessionData[] | undefined>(undefined);
	const [sampleScheduleBData, setSampleScheduleB] = useState<JudgingSessionData[] | undefined>(undefined);

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
													// make email function
													sendJudgeScheduleEmailReminder();
													setTestingSchedule(false);
												}}
												style={{ marginBottom: '10px' }}>
												Confirm Schedule
											</Button>
										) : (
											<Button
												onClick={() => {
													//console.log(hackers);
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
