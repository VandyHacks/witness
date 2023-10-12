import { UserData, TeamData } from '../../types/database';
import { RequestType, useCustomSWR } from '../../utils/request-utils';
import styles from '../../styles/hacker/Table.module.css';

interface LeaderboardData extends Omit<UserData, 'team'> {
	team: TeamData;
}

const Leaderboard = () => {
	// Leaderboard data
	const { data: leaderboardData, error: leaderboardError } = useCustomSWR<LeaderboardData[]>({
		url: '/api/leaderboard',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of hackers on the leaderboard.',
	});

	return (
		<div className={styles.Container}>
			Leaderboard
			{leaderboardError ? (
				<div className={styles.Placeholder}>Failed to load data.</div>
			) : !leaderboardData ? (
				<div className={styles.Placeholder}>Loading...</div>
			) : (
				<div className={styles.TableContainer}>
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Team</th>
								<th>Points</th>
							</tr>
						</thead>
						<tbody>
							{leaderboardData?.map(entry => (
								<tr key={entry.name}>
									<td>{entry.name}</td>
									<td>{entry.team?.name}</td>
									<td>{entry.nfcPoints}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default Leaderboard;
