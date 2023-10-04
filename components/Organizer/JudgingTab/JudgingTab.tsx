import { Skeleton } from 'antd';
import { TeamData, ScoreData, UserData } from '../../../types/database';
import { useCustomSWR, RequestType } from '../../../utils/request-utils';
import AllScores from './allScores';
import styles from '../../../styles/Organizer.module.css';

const JudgingTab = () => {
	// Teams data
	const { data: teamsData, error: teamsError } = useCustomSWR<TeamData[]>({
		url: '/api/teams',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of teams.',
	});

	// Scores data
	const { data: scoresData, error: scoresError } = useCustomSWR<ScoreData[]>({
		url: '/api/scores',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of scores.',
	});

	// Judge data
	const { data: judgeData, error: judgeError } = useCustomSWR<UserData[]>({
		url: '/api/users?usertype=JUDGE',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of judges.',
	});

	// Combine all the loading, null, and error states
	const error = teamsError || scoresError || judgeError;
	const dataNull = !teamsData || !scoresData || !judgeData;

	return (
		<div className={styles.tab}>
			{error ? (
				<div>Failed to load data.</div>
			) : dataNull ? (
				<div>Loading...</div>
			) : (
				<AllScores teamData={teamsData} scoreData={scoresData} userData={judgeData} />
			)}
		</div>
	);
};

export default JudgingTab;
