import { Space, Table, Collapse, Tag, Typography, Switch } from 'antd';
import React, { useState } from 'react';
import { ScheduleData } from '../pages/api/schedule';
import { DateTime } from 'luxon';

const { Panel } = Collapse;
const { Link } = Typography;

interface ScheduleProps {
	data: ScheduleData[];
}

const renderPeople = (people: string[]) => (
	<>
		{people.map(person => (
			<div key={person}>{person}</div>
		))}
	</>
);

// const columns = [
// 	{
// 		title: 'Time',
// 		dataIndex: 'time',
// 		key: 'time',
// 		render: renderAMPM,
// 	},
// 	{
// 		title: 'Project',
// 		dataIndex: 'projectName',
// 		key: 'projectName',
// 	},
// 	{
// 		title: 'Devpost',
// 		dataIndex: 'devpost',
// 		key: 'devpost',
// 		render: renderURL,
// 	},
// 	{
// 		title: 'Members',
// 		dataIndex: 'teamMembers',
// 		key: 'teamMembers',
// 		render: renderPeople,
// 	},
// 	{
// 		title: 'Judges',
// 		dataIndex: 'judges',
// 		key: 'judges',
// 		render: renderPeople,
// 	},
// 	{
// 		title: 'Zoom',
// 		dataIndex: 'zoom',
// 		key: 'zoom',
// 		render: renderURL,
// 	},
// ];

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

// function flatten(data: JudgingData[]) {
// 	return data.map(entry => ({
// 		...entry,
// 		time: entry.time,
// 		projectName: entry.team.projectName,
// 		devpost: entry.team.devpostURL,
// 		zoom: entry.zoomURL,
// 		teamMembers: entry.team.members,
// 		key: entry.team.members.toString(),
// 	}));
// }

export default function Schedule(props: ScheduleProps) {
	const { data } = props;
	const [showPast, setShowPast] = useState(false);

	// TODO: this is kinda dumb, might be good to just get the rooms and judges directly from db
	const rooms = [...new Set(data.map(judgingSession => judgingSession.zoomURL))];
	const columns = [
		{
			title: 'Time',
			dataIndex: 'time',
			key: 'time',
			width: 100,
			render: (timestamp: number) => DateTime.fromMillis(timestamp).toLocaleString(DateTime.TIME_SIMPLE),
		},
		...rooms.map((roomURL, roomNum) => ({
			title: <a href={roomURL}>Room {roomNum + 1}</a>,
			dataIndex: roomURL,
			key: (roomNum + 1).toString(),
			// Data should include everything in ScheduleData except for startTime and zoomURL
			render: function TableCell(data: Omit<ScheduleData, 'startTime' | 'zoomURL'> | null) {
				return data ? (
					<Space direction="vertical">
						<Collapse ghost>
							<Panel header={<u>{data.projectName}</u>} key="info">
								<ul>
									<li key={`${data.projectName}-hackers`}>
										<span>Hackers: </span>
										{data.members.map(member => (
											<Tag key={member.id}>{member.name}</Tag>
										))}
									</li>
									<li key={`${data.projectName}-devpost`}>
										Devpost <Link href={data.devpostURL}>link</Link>
									</li>
								</ul>
							</Panel>
						</Collapse>
						<div>
							<ul>
								<li>
									<span>Judges: </span>
									{data.judges.map(judge => (
										<Tag key={judge.id}>{judge.name}</Tag>
									))}
								</li>
							</ul>
						</div>
					</Space>
				) : (
					data
				);
			},
		})),
	];
	// Get stuff
	// const dataAsMap = new Map();
	// data.forEach(judgingSession => {
	// 	if (dataAsMap.has(judgingSession.startTime) {
	// 		dataAsMap.get(judgingSession.startTime)!.push(1)
	// 	})
	// });
	// Reorganize data to be fed into table
	const dataAsMap = new Map();
	data.forEach(judgingSession => {
		if (!dataAsMap.has(judgingSession.startTime)) {
			dataAsMap.set(judgingSession.startTime, Object.fromEntries(rooms.map(room => [room, null])));
		}
		const { startTime, zoomURL, ...rest } = judgingSession;
		dataAsMap.get(startTime)[zoomURL] = rest;
	});
	const tableData = [...dataAsMap.entries()].map(pair => ({
		time: pair[0],
		...pair[1],
	}));
	// Now fill the table
	return (
		<Table
			dataSource={tableData}
			columns={columns}
			pagination={false}
			sticky
			bordered
			scroll={{ x: true }}
			summary={_ => (
				<Table.Summary fixed={true}>
					<Table.Summary.Row>
						<Table.Summary.Cell index={0} colSpan={2}>
							<span> </span>
							<Switch
								checkedChildren="Hide past sessions"
								unCheckedChildren="Include past sessions"
								onChange={() => {
									console.log('ehllo');
								}}
							/>
						</Table.Summary.Cell>
						<Table.Summary.Cell index={2} colSpan={8} />
					</Table.Summary.Row>
				</Table.Summary>
			)}
		/>
	);
}
