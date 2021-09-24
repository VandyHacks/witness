import { Card } from 'antd';
import styles from '../styles/Dashboard.module.css';
import { JudgingData } from '../types/types';

export default function OnDeck(props: JudgingData) {
	return (
		// TODO: make this nicer format
		<Card title="Up Next">
			<div className={styles.onDeck}>
				<h1>{props.team.projectName}</h1>
				<span>
					<strong>Team: </strong>
					<ul>
						{props.team.members.map(member => (
							<li key={member}>{member}</li>
						))}
					</ul>
				</span>
				<span>
					<strong>Judges: </strong>
					<ul>
						{props.judges.map(judge => (
							<li key={judge}>{judge}</li>
						))}
					</ul>
				</span>
				<span>
					<strong>Devpost: </strong>
					<a href={props.team.devpostURL.toString()} target="_blank" rel="noreferrer">
						{props.team.devpostURL.toString()}
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
