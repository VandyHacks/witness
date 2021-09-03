import styles from '../styles/Dashboard.module.css';

interface OnDeckProps {
	time: number;
	projectName: string;
	teamMembers: string[];
	devpostURL: URL;
	judges: string[];
	zoomURL: URL;
}

export default function OnDeck(props: OnDeckProps) {
	return (
		<div className={styles.onDeck}>
			{/* TODO: fill this in with actual formatting */}
			<span>{'Project: ' + props.projectName}</span>
			<span>{'Team: ' + props.teamMembers}</span>
			<span>{'Judges: ' + props.judges}</span>
			<span>{'Devpost: ' + props.devpostURL}</span>
			<span>{'Zoom: ' + props.zoomURL}</span>
		</div>
	);
}
