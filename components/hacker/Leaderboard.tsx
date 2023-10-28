import { UserData, TeamData } from '../../types/database';
import { RequestType, useCustomSWR } from '../../utils/request-utils';
import styles from '../../styles/hacker/Table.module.css';
import { useEffect, useState } from 'react';

interface LeaderboardData extends Omit<UserData, 'team'> {
	team: TeamData;
}

const Leaderboard = ({ limit = 10, isRotating = false }: { limit?: number; isRotating?: boolean }) => {
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [currentLeaderboardData, setCurrentLeaderboardData] = useState<LeaderboardData[] | undefined>(undefined);

	// Leaderboard data
	const { data: leaderboardData, error: leaderboardError } = useCustomSWR<LeaderboardData[]>({
		url: `/api/leaderboard?limit=${limit}`,
		method: RequestType.GET,
		errorMessage: 'Failed to get list of hackers on the leaderboard.',
	});

	// start a timer that updates the leaderboard every 5 seconds
	useEffect(() => {
		if (isRotating) {
			const interval = setInterval(() => {
				if (currentPage === totalPages) {
					setCurrentPage(1);
				} else {
					setCurrentPage(currentPage + 1);
				}
			}, 5000);

			return () => clearInterval(interval);
		}
	}, [currentPage, isRotating, totalPages]);

	useEffect(() => {
		if (leaderboardData) {
			setCurrentLeaderboardData(leaderboardData.slice((currentPage - 1) * 10, currentPage * 10));
			setTotalPages(Math.floor(leaderboardData.length / 15));
		}
	}, [leaderboardData, currentPage]);

	return (
		<div className={styles.Container}>
			Points Leaderboard
			<div className={styles.Description}>
				Participate and check in to events to earn points. Points can be used to redeem prizes!
			</div>
			{leaderboardError ? (
				<div className={styles.Placeholder}>Failed to load data.</div>
			) : !currentLeaderboardData ? (
				<div className={styles.Placeholder}>Loading...</div>
			) : (
				<div className={styles.TableContainer}>
					<table>
						<thead>
							<tr>
								<th>Rank</th>
								<th>Name</th>
								<th>Team</th>
								<th>Points</th>
							</tr>
						</thead>
						<tbody>
							{currentLeaderboardData?.map((entry, index) => (
								<tr key={entry.name}>
									<td>{(currentPage - 1) * 10 + index + 1}</td>
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
