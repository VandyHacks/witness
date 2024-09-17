import { Button, InputNumber, Slider, Row, Col } from 'antd';
import { SetStateAction, useContext, useEffect, useState } from 'react';
import { matchTeams, handleConfirmSchedule } from '../../../utils/organizer-utils';
import OrganizerSchedule, { generateTimes } from '../../judges/schedule';
import { ResponseError, JudgingSessionData, UserData, TeamData, HackathonSettingsData } from '../../../types/database';
import Title from 'antd/lib/typography/Title';
import { RequestType, useCustomSWR } from '../../../utils/request-utils';
import { ThemeContext, getBaseColor } from '../../../theme/themeProvider';
import { handleSubmitFailure } from '../../../lib/helpers';

const ScheduleTab = () => {
	// React state
	const [timesJudged, setTimesJudged] = useState<number>(1);
	const [maxTimesJudged, setMaxTimesJudged] = useState<number>(0);
	const [potentialSchedule, setPotentialSchedule] = useState<JudgingSessionData[] | undefined>(undefined);
	const [hackathonSettings, setHackathonSettings] = useState<HackathonSettingsData | undefined>(undefined);

	const { baseTheme } = useContext(ThemeContext);

	// Get hackathon settings
	useEffect(() => {
		const fetchHackathonSettings = async () => {
			const res = await fetch('/api/hackathon-settings');
			if (res.ok) {
				const settings = await res.json();
				setHackathonSettings(settings as HackathonSettingsData);
			}
		};
		fetchHackathonSettings();
	}, []);

	const TimeForJudgeToScoreOneTeam = parseInt(hackathonSettings?.JUDGING_TIME_PER_TEAM as string, 10);
	const JudgingDuration = hackathonSettings?.JUDGING_DURATION as number;
	const MaximumNumberOfTeamsOneJudgeCanFinishInJudgingTime = JudgingDuration / TimeForJudgeToScoreOneTeam;

	// Get judging sessions
	const { data: judgingSessions, error: judgingSessionsError } = useCustomSWR<JudgingSessionData[]>({
		url: '/api/judging-sessions',
		method: RequestType.GET,
		errorMessage: 'Failed to get judging sessions',
	});

	// Judge data
	const { data: judgesData, error: judgesError } = useCustomSWR<UserData[]>({
		url: '/api/users?usertype=JUDGE&isCheckedIn=true',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of judges.',
	});

	// Teams data
	const { data: teamsData, error: teamsError } = useCustomSWR<TeamData[]>({
		url: '/api/teams?submitted=true',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of teams.',
	});

	// Confirm potential schedule
	const handleConfirmPotentialSchedules = (potentialSchedule: JudgingSessionData[] | undefined) => {
		// Exit early if we don't have data yet
		if (!potentialSchedule) return;

		// Send requests to confirm the schedule
		handleConfirmSchedule(potentialSchedule);
	};

	// Set potential schedule
	const handleCreateNewPotentialSchedules = (teams: TeamData[], judges: UserData[]) => {
		// Confirm with user
		if (!window.confirm('Are you sure you want to create a new schedule?')) return;

		if (timesJudged < 1 || timesJudged > maxTimesJudged) {
			handleSubmitFailure('Invalid number of judging sessions per team.');
			return;
		}

		// Set that potential schedules as newly generated schedules
		let judgingTimes = generateTimes(
			new Date(hackathonSettings?.JUDGING_START as string),
			new Date(hackathonSettings?.JUDGING_END as string),
			TimeForJudgeToScoreOneTeam
		);
		setPotentialSchedule(matchTeams(teams, judges, judgingTimes, timesJudged));
	};

	useEffect(() => {
		if (!teamsData || !judgesData) return;
		setMaxTimesJudged(
			Math.floor((judgesData?.length * MaximumNumberOfTeamsOneJudgeCanFinishInJudgingTime) / teamsData?.length)
		);
	}, [teamsData, judgesData, hackathonSettings]);

	useEffect(() => {
		// Exit early if we don't have data yet
		if (!judgingSessions) return;
		// Set the data
		setPotentialSchedule(judgingSessions);
	}, [judgingSessions, hackathonSettings]);

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
					<Row style={{ marginBottom: '-8px' }}>
						<Col style={{ margin: 'auto 8px auto 0' }}>Number of Judging Sessions Per Team:</Col>
						<Col>
							<InputNumber
								style={{ margin: '0 1px' }}
								min={1}
								max={10}
								value={timesJudged || null}
								onChange={input => {
									setTimesJudged(input || 1);
								}}
								status={1 <= timesJudged && timesJudged <= maxTimesJudged ? '' : 'error'}
							/>
						</Col>
						<Col span={4}>
							<Slider
								min={1}
								max={10}
								onChange={setTimesJudged}
								value={timesJudged}
								style={{ marginLeft: '20px' }}
							/>
						</Col>
					</Row>
					<br />
					<Button
						onClick={() => handleCreateNewPotentialSchedules(teamsData, judgesData)}
						style={{ marginBottom: '10px' }}>
						Generate Potential Judging Schedule
					</Button>
					{potentialSchedule && (
						<Button
							onClick={() => handleConfirmPotentialSchedules(potentialSchedule)}
							style={{ marginBottom: '10px', marginLeft: '10px' }}>
							Confirm Schedule
						</Button>
					)}

					<br />
					<div>Count of Teams: {teamsData?.length}</div>
					<div>Count of Judges: {judgesData?.length}</div>
					<div>Maximum Possible Number of Judging Sessions Per Team: {maxTimesJudged}</div>
					<Title
						style={{
							color: getBaseColor(baseTheme),
						}}>
						Judging Schedule
					</Title>
					{potentialSchedule && (
						<OrganizerSchedule
							data={potentialSchedule}
							handleChange={function (value: SetStateAction<string>): void {
								throw new Error('Function not implemented.');
							}}
							TimeForJudgeToScoreOneTeam={TimeForJudgeToScoreOneTeam}
							sessionTimeStart={new Date(hackathonSettings?.JUDGING_START as string)}
							sessionTimeEnd={new Date(hackathonSettings?.JUDGING_END as string)}
						/>
					)}
				</>
			)}
		</>
	);
};

export default ScheduleTab;