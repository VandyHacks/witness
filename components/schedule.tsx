import { Card, Table } from 'antd';
import React from 'react';
import { JudgingData } from '../types/types';

interface ScheduleProps {
	data: JudgingData[];
}

const renderPeople = (people: string[]) => (
	<>
		{people.map(person => (
			<div key={person}>{person}</div>
		))}
	</>
);

const columns = [
	{
		title: 'Time',
		dataIndex: 'time',
		key: 'time',
		render: renderAMPM,
	},
	{
		title: 'Project',
		dataIndex: 'projectName',
		key: 'projectName',
	},
	{
		title: 'Devpost',
		dataIndex: 'devpost',
		key: 'devpost',
		render: renderURL,
	},
	{
		title: 'Members',
		dataIndex: 'teamMembers',
		key: 'teamMembers',
		render: renderPeople,
	},
	{
		title: 'Judges',
		dataIndex: 'judges',
		key: 'judges',
		render: renderPeople,
	},
	{
		title: 'Zoom',
		dataIndex: 'zoom',
		key: 'zoom',
		render: renderURL,
	},
];

function renderAMPM(time: number) {
	const date = new Date(time);
	let hours = date.getHours() % 12;
	const ampm = hours >= 12 ? 'pm' : 'am';
	hours = hours === 0 ? hours : 12;
	let minutes = date.getMinutes().toString();
	minutes = minutes.length < 2 ? '0' + minutes : minutes;
	var strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}

function renderURL(url: URL) {
	return (
		<a href={url.toString()} target="_blank" rel="noreferrer">
			{url.toString()}
		</a>
	);
}

function flatten(data: JudgingData[]) {
	return data.map(entry => ({
		...entry,
		time: entry.time,
		projectName: entry.team.projectName,
		devpost: entry.team.devpostURL,
		zoom: entry.zoomURL,
		teamMembers: entry.team.members,
		key: entry.team.members.toString(),
	}));
}

export default function Schedule(props: ScheduleProps) {
	let { data } = props;
	return <Table dataSource={flatten(data)} columns={columns} pagination={false} />;
}
