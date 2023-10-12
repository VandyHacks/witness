import { JudgingSessionData } from '../../types/database';
import styles from '../../styles/hacker/Table.module.css';

interface JudgingScheduleProps {
	judgingSessionData: JudgingSessionData[] | undefined;
}

const judgingSchedule = [
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
	{
		time: 'December 17, 1995 11:40:00',
		team: {
			locationNum: 11,
		},
		judge: {
			name: 'Loren Quigley Sr.',
		},
	},
];

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
							{judgingSchedule?.map(entry => (
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
