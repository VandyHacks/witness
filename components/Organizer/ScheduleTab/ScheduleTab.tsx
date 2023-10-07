import { Button, Skeleton, Divider } from 'antd';
import { SetStateAction, useContext, useEffect, useState } from 'react';
import {
	TIMES_JUDGED,
	generateScheduleA,
	generateScheduleB,
	handleConfirmSchedule,
} from '../../../utils/organizer-utils';
import OrganizerSchedule from '../../judges/schedule';
import { ResponseError, JudgingSessionData, UserData, TeamData } from '../../../types/database';
import Title from 'antd/lib/typography/Title';
import { RequestType, useCustomSWR } from '../../../utils/request-utils';
import { ThemeContext, getBaseColor } from '../../../theme/themeProvider';

const ScheduleTab = () => {
	// React state
	const [potentialScheduleA, setPotentialScheduleA] = useState<JudgingSessionData[] | undefined>(undefined);
	const [potentialScheduleB, setPotentialScheduleB] = useState<JudgingSessionData[] | undefined>(undefined);

	const { baseTheme } = useContext(ThemeContext);

	// Get judging sessions
	const { data: judgingSessions, error: judgingSessionsError } = useCustomSWR<JudgingSessionData[]>({
		url: '/api/judging-sessions',
		method: RequestType.GET,
		errorMessage: 'Failed to get judging sessions',
	});

	// Judge data
	const { data: judgesData, error: judgesError } = useCustomSWR<UserData[]>({
		url: '/api/users?usertype=JUDGE',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of judges.',
	});

	// Teams data
	const { data: teamsData, error: teamsError } = useCustomSWR<TeamData[]>({
		url: '/api/teams',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of teams.',
	});

	// Check if schedule is impossible
	const isScheduleImpossible = () =>
		teamsData && judgesData && (teamsData.length * TIMES_JUDGED) / 12 > judgesData.length;

	// Confirm potential schedule
	const handleConfirmPotentialSchedules = (
		potentialScheduleA: JudgingSessionData[] | undefined,
		potentialScheduleB: JudgingSessionData[] | undefined
	) => {
		// Exit early if we don't have data yet
		if (!potentialScheduleA || !potentialScheduleB) return;

		// Send requests to confirm the schedule
		handleConfirmSchedule(potentialScheduleA);
		handleConfirmSchedule(potentialScheduleB);
	};

	// Set potential schedule
	const handleCreateNewPotentialSchedules = (teams: TeamData[], judges: UserData[]) => {
		// Confirm with user
		if (!window.confirm('Are you sure you want to create a new schedule?')) return;

		// Set that potential schedules as newly generated schedules
		setPotentialScheduleA(generateScheduleA(teams, judges));
		setPotentialScheduleB(generateScheduleB(teams, judges));
	};

	useEffect(() => {
		// Exit early if we don't have data yet
		if (!judgingSessions) return;

		// Sort judging sessions by time
		const time = new Date('2022-10-23T11:00:00').getTime();

		// Set the data after filtering it by time
		setPotentialScheduleA(
			judgingSessions.filter(judgingSession => new Date(judgingSession.time as string).getTime() < time)
		);
		setPotentialScheduleB(
			judgingSessions.filter(judgingSession => new Date(judgingSession.time as string).getTime() >= time)
		);
	}, [judgingSessions]);

	// Combine all the loading, null, and error states
	const error = judgingSessionsError || judgesError || teamsError;
	const dataNull = !judgingSessions || !judgesData || !teamsData;

	return (
		<>
			{error ? (
				<div>{error ? (error as ResponseError).message : 'Failed to get data.'}</div>
			) : dataNull ? (
				<div>Loading...</div>
			) : (
				<>
					<Button
						onClick={() => handleCreateNewPotentialSchedules(teamsData, judgesData)}
						style={{ marginBottom: '10px' }}>
						Generate Potential Judging Schedule
					</Button>
					{potentialScheduleA && potentialScheduleB && (
						<Button
							onClick={() => handleConfirmPotentialSchedules(potentialScheduleA, potentialScheduleB)}
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
					<Title
						style={{
							color: getBaseColor(baseTheme),
						}}>
						Expo A
					</Title>
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
					<Title
						style={{
							color: getBaseColor(baseTheme),
						}}>
						Expo B
					</Title>
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
