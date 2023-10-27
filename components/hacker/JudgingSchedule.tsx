import { JudgingSessionData } from '../../types/database';
import styles from '../../styles/hacker/Table.module.css';

interface JudgingScheduleProps {
	judgingSessionData: JudgingSessionData[] | undefined;
}

/**
 * Convert the given time into a 10 minute time range
 * @param time Start time
 * @returns Formatted 10 minute time range starting from the given time
 */
const renderJudgingTime = (time: string) => {
	let startTime = new Date(time);
	// add 10 minutes
	let endTime = new Date(startTime.getTime() + 10 * 60000);
	// return <>{startTime.getHours()}:{startTime.getMinutes()} - {endTime.getHours()}:{endTime.getMinutes()}</>
	return (
		<>
			{startTime.toLocaleTimeString('default', {
				hour: '2-digit',
				minute: '2-digit',
			})}{' '}
			-{' '}
			{endTime.toLocaleTimeString('default', {
				hour: '2-digit',
				minute: '2-digit',
			})}
		</>
	);
};

const JudgingSchedule = ({ judgingSessionData }: JudgingScheduleProps) => {
	return (
		<div className={styles.Container}>
			Judging Schedule
			<div className={styles.Description}>
				You will be assigned a table and judge for judging. Please be at your table at the time indicated below.
			</div>
			{judgingSessionData?.length === 0 ? (
				<div className={styles.Placeholder}>Schedule will show up here when hacking ends!</div>
			) : (
				<div className={styles.TableContainer}>
					<table>
						<thead>
							<tr>
								<th>Time</th>
								<th>Table</th>
								<th>Judge</th>
							</tr>
						</thead>
						<tbody>
							{judgingSessionData?.map(entry => (
								<tr key={entry.time.toString()}>
									<td>{renderJudgingTime(entry.time.toString())}</td>
									<td>{entry.team.locationNum}</td>
									<td>{entry.judge.name}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default JudgingSchedule;
