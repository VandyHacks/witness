import { Button, Skeleton, Divider } from 'antd';
import { SetStateAction, useEffect, useState } from 'react';
import {
	TIMES_JUDGED,
	generateScheduleA,
	generateScheduleB,
	handleConfirmSchedule,
} from '../../../utils/organizer-utils';
import OrganizerSchedule from '../../schedule';
import useSWR, { useSWRConfig } from 'swr';
import { ResponseError, JudgingSessionData, UserData, TeamData } from '../../../types/database';
import Title from 'antd/lib/typography/Title';

const ScheduleTab = () => {
	// React state
	const [testingSchedule, setTestingSchedule] = useState(false);
	const [sampleScheduleAData, setSampleScheduleA] = useState<JudgingSessionData[] | undefined>(undefined);
	const [sampleScheduleBData, setSampleScheduleB] = useState<JudgingSessionData[] | undefined>(undefined);

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

	// Check if schedule is impossible
	const isScheduleImpossible = () =>
		teamsData && judgeData && (teamsData.length * TIMES_JUDGED) / 12 > judgeData.length;

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

	return (
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
							if (!window.confirm('Are you sure you want to create a new schedule?')) return;
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
	);
};

export default ScheduleTab;
