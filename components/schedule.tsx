import { Space, Table, Collapse, Tag, Typography, Switch, Skeleton, Timeline, Button } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { ScheduleData } from '../pages/api/schedule';
import { DateTime } from 'luxon';
import { judgingLength } from '../pages/dashboard';
import Link from 'next/link';

const { Panel } = Collapse;
// const { Link } = Typography;

interface ScheduleProps {
	data: ScheduleData[];
	cutoffIndex: number;
	// onScheduleAdvance: () => void;
}

// Data should include everything in ScheduleData except for startTime and zoomURL
function TableCell(data: Omit<ScheduleData, 'startTime' | 'zoomURL'> | null) {
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
}

export function JudgeSchedule({ data, cutoffIndex }: ScheduleProps) {
	const [showPast, setShowPast] = useState(false);
	let key = 0;
	const columns = [
		{
			title: 'Time',
			dataIndex: 'time',
			key: 'time',
			width: 100,
			render: (timestamp: number) => DateTime.fromMillis(timestamp).toLocaleString(DateTime.TIME_SIMPLE),
		},
		{
			title: 'Project',
			dataIndex: 'project',
			key: 'project',
			render: ({ name, link }: { name: string; link: URL }) => (
				<Link href={link} passHref>
					<Button type="link">{name}</Button>
				</Link>
			),
		},
		{
			title: 'Team Members',
			dataIndex: 'teamMembers',
			key: 'teamMembers',
			render: (members: string[]) => members.map(member => <Tag key={member + key++}>{member}</Tag>),
		},
		{
			title: 'Judges',
			dataIndex: 'judges',
			key: 'judges',
			render: (judges: string[]) => judges.map(judge => <Tag key={judge + key++}>{judge}</Tag>),
		},
		{
			title: 'Room',
			dataIndex: 'room',
			key: 'room',
			render: (link: URL) => (
				<Link href={link} passHref>
					<Button type="link">Go to room</Button>
				</Link>
			),
		},
	];
	const dataSource = data.slice(showPast ? 0 : cutoffIndex).map(item => ({
		time: item.startTime,
		project: { name: item.projectName, link: new URL(item.devpostURL) },
		teamMembers: item.members,
		judges: item.judges,
		room: item.zoomURL,
	}));
	return (
		<Table
			dataSource={dataSource}
			columns={columns}
			pagination={false}
			sticky
			bordered
			scroll={{ x: true }}
			summary={_ => (
				<Table.Summary fixed={true}>
					<Table.Summary.Row>
						<Table.Summary.Cell index={0} colSpan={5}>
							<Switch
								checkedChildren="Hide past sessions"
								unCheckedChildren="Include past sessions"
								onChange={checked => {
									setShowPast(checked);
								}}
							/>
						</Table.Summary.Cell>
					</Table.Summary.Row>
				</Table.Summary>
			)}
		/>
	);
}

export default function Schedule(props: ScheduleProps) {
	const { data, onScheduleAdvance } = props;
	const [showPast, setShowPast] = useState(false);

	// TODO: this is kinda dumb, might be good to just get the rooms directly from db
	const rooms = useMemo(() => [...new Set(data.map(judgingSession => judgingSession.zoomURL))], [data]);
	const columns = useMemo(
		() => [
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
				render: TableCell,
			})),
		],
		[rooms]
	);
	// Reorganize data to be fed into table
	const tableData = useMemo(() => {
		const dataAsMap = new Map();
		data.forEach(judgingSession => {
			if (!dataAsMap.has(judgingSession.startTime)) {
				dataAsMap.set(judgingSession.startTime, Object.fromEntries(rooms.map(room => [room, null])));
			}
			const { startTime, zoomURL, ...rest } = judgingSession;
			dataAsMap.get(startTime)[zoomURL] = rest;
		});
		onScheduleAdvance(); // Load card data when schedule is first available without upsetting React (too much).
		return [...dataAsMap.entries()].map(pair => ({
			time: pair[0],
			...pair[1],
		}));
	}, [data, rooms]); // Not including onScheduleAdvance as that causes memory leak.

	// Keeps track of where in the overall schedule we currently are
	const [currentIndex, setCurrentIndex] = useState(0);
	const [stillJudging, setStillJudging] = useState(true);
	// Prevents a flash of full schedule before filtering only to future events
	const [dataLoaded, setDataLoaded] = useState(false);
	// Keep track of where the top of the schedule show point to.
	useEffect(() => {
		const interval = setInterval(() => {
			const now = Date.now();
			if (stillJudging && now > tableData[currentIndex].time + judgingLength) {
				// Search for next satisfying timestamp. If none exists, we are done judging and should no longer update.
				if (
					!tableData.slice(currentIndex).some((timeSlot, index) => {
						if (timeSlot.time + judgingLength > now) {
							setCurrentIndex(index);
							onScheduleAdvance(); // Reload card data every 10 minutes.
							return true;
						}
					})
				) {
					setCurrentIndex(tableData.length);
					setStillJudging(false);
				}
			}
			setDataLoaded(true);
		}, 1000);
		return () => clearInterval(interval);
	});

	// Now fill the table
	return dataLoaded ? (
		<Table
			dataSource={showPast ? tableData : tableData.slice(currentIndex)}
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
								onChange={checked => {
									setShowPast(checked);
								}}
							/>
						</Table.Summary.Cell>
						<Table.Summary.Cell index={2} colSpan={8} />
					</Table.Summary.Row>
				</Table.Summary>
			)}
		/>
	) : (
		<Skeleton />
	);
}
