import { Button, Skeleton, Divider } from 'antd';
import { SetStateAction, useEffect, useState } from 'react';
import {
	TIMES_JUDGED,
	generateScheduleA,
	generateScheduleB,
	handleConfirmSchedule,
} from '../../../utils/organizer-utils';
import OrganizerSchedule from '../../schedule';
import { ResponseError, JudgingSessionData, UserData, TeamData } from '../../../types/database';
import Title from 'antd/lib/typography/Title';
import { RequestType, useCustomSWR } from '../../../utils/request-utils';

const ScheduleTab = () => {
	// React state
	const [potentialScheduleA, setPotentialScheduleA] = useState<JudgingSessionData[] | undefined>(undefined);
	const [potentialScheduleB, setPotentialScheduleB] = useState<JudgingSessionData[] | undefined>(undefined);

	// Get judging sessions
	const {
		data: judgingSessions,
		error: judgingSessionsError,
		isLoading: isLoadingJudgingSessions,
	} = useCustomSWR<JudgingSessionData>({
		url: '/api/judging-sessions',
		method: RequestType.GET,
		errorMessage: 'Failed to get judging sessions',
	});

	// Judge data
	const {
		data: judgesData,
		error: judgesError,
		isLoading: isLoadingJudges,
	} = useCustomSWR<UserData>({
		url: '/api/users?usertype=JUDGE',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of judges.',
	});

	// Teams data
	const {
		data: teamsData,
		error: teamsError,
		isLoading: isLoadingTeams,
	} = useCustomSWR<TeamData>({
		url: '/api/teams',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of teams.',
	});

	// Check if schedule is impossible
	const isScheduleImpossible = () =>
		teamsData && judgesData && (teamsData.length * TIMES_JUDGED) / 12 > judgesData.length;

	// Confirm sample schedule
	const handleConfirmSampleSchedule = (
		sampleA: JudgingSessionData[] | undefined,
		sampleB: JudgingSessionData[] | undefined
	) => {
		// Exit early if we don't have data yet
		if (!sampleA || !sampleB) return;

		// Confirm schedule with sample data
		handleConfirmSchedule(sampleA);
		handleConfirmSchedule(sampleB);
	};

	// Set sample schedule
	const handleCreateNewPotentialSchedules = (teams: TeamData[], judges: UserData[]) => {
		if (!window.confirm('Are you sure you want to create a new schedule?')) return;

		setPotentialScheduleA(generateScheduleA(teams, judges));
		setPotentialScheduleB(generateScheduleB(teams, judges));
	};

	useEffect(() => {
		// Exit early if we don't have data yet
		if (!judgingSessions) return;

		// Sort judging sessions by time
		const time = new Date('2022-10-23T11:00:00').getTime();
		const sampleScheduleA = judgingSessions.filter(
			judgingSession => new Date(judgingSession.time as string).getTime() < time
		);
		const sampleScheduleB = judgingSessions.filter(
			judgingSession => new Date(judgingSession.time as string).getTime() >= time
		);

		// Set the data
		setPotentialScheduleA(sampleScheduleA);
		setPotentialScheduleB(sampleScheduleB);
	}, [judgingSessions]);

	const error = judgingSessionsError || judgesError || teamsError;
	const dataNull = !judgingSessions || !judgesData || !teamsData;
	const loading = isLoadingJudgingSessions || isLoadingJudges || isLoadingTeams;

	return (
		<>
			{loading ? (
				<div>Loading...</div>
			) : error || dataNull ? (
				<div>{error ? (error as ResponseError).message : 'Failed to get data.'}</div>
			) : (
				<>
					<Button
						onClick={() => handleCreateNewPotentialSchedules(teamsData, judgesData)}
						style={{ marginBottom: '10px' }}>
						Generate Potential Judging Schedule
					</Button>
					{potentialScheduleA && potentialScheduleB && (
						<Button
							onClick={() => handleConfirmSampleSchedule(potentialScheduleA, potentialScheduleB)}
							style={{ marginBottom: '10px' }}>
							Confirm Schedule
						</Button>
					)}

					<br />
					{isScheduleImpossible() ? (
						<div>The schedule is impossible! Run.</div>
					) : (
						<div>The schedule is possible!</div>
					)}
					<div>Count of Teams: {teamsData?.length}</div>
					<div>Count of Judges: {judgesData?.length}</div>
					<Title>Expo A</Title>
					{potentialScheduleA && (
						<OrganizerSchedule
							data={potentialScheduleA}
							handleChange={function (value: SetStateAction<string>): void {
								throw new Error('Function not implemented.');
							}}
							sessionTimeStart={new Date('2022-10-23T10:00:00')}
							sessionTimeEnd={new Date('2022-10-23T11:00:00')}
						/>
					)}
					<div style={{ height: '20px' }} />
					<Title>Expo B</Title>
					{potentialScheduleB && (
						<OrganizerSchedule
							data={potentialScheduleB}
							handleChange={function (value: SetStateAction<string>): void {
								throw new Error('Function not implemented.');
							}}
							sessionTimeStart={new Date('2022-10-23T11:30:00')}
							sessionTimeEnd={new Date('2022-10-23T12:30:00')}
						/>
					)}
				</>
			)}
		</>
	);
};

export default ScheduleTab;
