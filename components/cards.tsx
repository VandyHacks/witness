import React from 'react';
import { Row, Col } from 'antd';
import { Card } from 'antd';
import styles from '../styles/Dashboard.module.css';
import { DateTime } from 'luxon';
import { ScheduleDisplay } from '../types/client';
interface ExtendedScheduleDisplay extends ScheduleDisplay {
	title: string;
	headStyle?: { backgroundColor: string };
}

function ScheduleCard(props: ExtendedScheduleDisplay) {
	return (
		// TODO: make this nicer format
		<Card title={props.title} type="inner" headStyle={props.headStyle}>
			<div className={styles.ScheduleItem}>
				<h1>{props.teamName}</h1>
				<span>
					<strong>When: </strong>
					{DateTime.fromISO(props.time).toLocaleString(DateTime.TIME_SIMPLE)}
				</span>
				<span>
					<strong>Team: </strong>
					<ul>
						{props.memberNames.map(name => (
							<li key={name}>{name}</li>
						))}
					</ul>
				</span>
				<span>
					<strong>Judges: </strong>
					<ul>
						{props.judgeNames.map(name => (
							<li key={name}>{name}</li>
						))}
					</ul>
				</span>
				<span>
					<strong>Devpost: </strong>
					<a href={props.devpost.toString()} target="_blank" rel="noreferrer">
						{props.devpost.toString()}
					</a>
				</span>
				<span>
					<strong>Zoom: </strong>
					<a href={props.zoom.toString()} target="_blank" rel="noreferrer">
						{props.zoom.toString()}
					</a>
				</span>
			</div>
		</Card>
	);
}

function Current(props: ScheduleDisplay | any) {
	return <ScheduleCard {...(props as ScheduleDisplay)} headStyle={{ backgroundColor: '#87e8de' }} title="Current" />;
}

function UpNext(props: ScheduleDisplay | any) {
	return <ScheduleCard {...(props as ScheduleDisplay)} headStyle={{ backgroundColor: '#ffe58f' }} title="Next Up" />;
}

function AllDone() {
	return (
		<Card title={'Mission Complete'} headStyle={{ backgroundColor: '#b7eb8f' }}>
			<h1>You are all done. Thank you for being a part of VandyHacks VIII!</h1>
		</Card>
	);
}
interface CardsProps {
	current: ScheduleDisplay | undefined;
	next: ScheduleDisplay | undefined;
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
