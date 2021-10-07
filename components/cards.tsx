import React from 'react';
import { Row, Col } from 'antd';
import { Card } from 'antd';
import styles from '../styles/Dashboard.module.css';
import { DateTime } from 'luxon';
import { ScheduleData } from '../pages/api/schedule';

type ScheduleItemProps = ScheduleData & {
	title: string;
	headStyle?: { backgroundColor: string };
};

function ScheduleCard(props: ScheduleItemProps) {
	return (
		// TODO: make this nicer format
		<Card title={props.title} type="inner" headStyle={props.headStyle}>
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

function Current(props: ScheduleData | any) {
	return <ScheduleCard {...(props as ScheduleData)} headStyle={{ backgroundColor: '#87e8de' }} title="Current" />;
}

function UpNext(props: ScheduleData | any) {
	return <ScheduleCard {...(props as ScheduleData)} headStyle={{ backgroundColor: '#ffe58f' }} title="Next Up" />;
}

function AllDone() {
	return (
		<Card title={'Mission Complete'} headStyle={{ backgroundColor: '#b7eb8f' }}>
			<h1>You are all done. Thank you for being a part of VandyHacks VIII!</h1>
		</Card>
	);
}
interface CardsProps {
	current: ScheduleData | undefined;
	next: ScheduleData | undefined;
}

export default function Cards({ current, next }: CardsProps) {
	if (current === undefined && next === undefined) {
		return <AllDone />;
	} else {
		return (
			<Row gutter={16}>
				{current && (
					<Col className="gutter-row" flex={1}>
						<Current {...current} />
					</Col>
				)}
				{next && (
					<Col className="gutter-row" flex={1}>
						<UpNext {...next} />
					</Col>
				)}
			</Row>
		);
	}
}
