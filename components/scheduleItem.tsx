import { Card } from 'antd';
import { ScheduleData } from '../pages/api/schedule';
import styles from '../styles/Dashboard.module.css';
import { DateTime } from 'luxon';

export type ScheduleItemProps = ScheduleData & {
	title: string;
};

function ScheduleCard(props: ScheduleItemProps) {
	return (
		// TODO: make this nicer format
		<Card title={props.title}>
			<div className={styles.ScheduleItem}>
				<h1>{props.projectName}</h1>
				<span>
					<strong>When: </strong>
					{DateTime.fromMillis(props.startTime).toLocaleString(DateTime.TIME_SIMPLE)}
				</span>
				<span>
					<strong>Team: </strong>
					<ul>
						{props.members.map(member => (
							<li key={member.id}>{member.name}</li>
						))}
					</ul>
				</span>
				<span>
					<strong>Judges: </strong>
					<ul>
						{props.judges.map(judge => (
							<li key={judge.id}>{judge.name}</li>
						))}
					</ul>
				</span>
				<span>
					<strong>Devpost: </strong>
					<a href={props.devpostURL.toString()} target="_blank" rel="noreferrer">
						{props.devpostURL.toString()}
					</a>
				</span>
				<span>
					<strong>Zoom: </strong>
					<a href={props.zoomURL.toString()} target="_blank" rel="noreferrer">
						{props.zoomURL.toString()}
					</a>
				</span>
			</div>
		</Card>
	);
}

export function Current(props: ScheduleData | undefined) {
	return <ScheduleCard {...(props as ScheduleData)} title="Current" />;
}

export function UpNext(props: ScheduleData | undefined) {
	return props ? (
		<ScheduleCard {...(props as ScheduleData)} title="Up Next" />
	) : (
		<Card title={'Mission Complete'}>
			<h1>You are all done! Thank you for participating in VandyHacks VIII!</h1>
		</Card>
	);
}
