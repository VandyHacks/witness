import { Space, Table, Collapse, Tag, Typography, Switch, Skeleton } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { ScheduleData } from '../pages/api/schedule';
import { DateTime } from 'luxon';

const { Panel } = Collapse;
const { Link } = Typography;

interface ScheduleProps {
	data: ScheduleData[];
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

export default function Schedule(props: ScheduleProps) {
	const { data } = props;
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
		return [...dataAsMap.entries()].map(pair => ({
			time: pair[0],
			...pair[1],
		}));
	}, [data, rooms]);

	// Keeps track of where in the overall schedule we currently are
	const [currentIndex, setCurrentIndex] = useState(0);
	const [nextTimeStamp, setNextTimeStamp] = useState(data[1].startTime);
	// Prevents a flash of full schedule before filtering only to future events
	const [dataLoaded, setDataLoaded] = useState(false);
	// Keep track of where the top of the schedule show point to.
	useEffect(() => {
		const interval = setInterval(() => {
			const now = Date.now();
			if (now > nextTimeStamp) {
				// Handle case where we've reached the end of the judging period
				if (now > tableData[tableData.length - 1].time) {
					setCurrentIndex(tableData.length - 1);
					setNextTimeStamp(2147483647);
				} else {
					// Search for next satisfying timestamp. Should usually just be the next one except for the initial case.
					tableData.slice(currentIndex).some((timeSlot, index) => {
						if (timeSlot.time > now) {
							setNextTimeStamp(timeSlot.time);
							setCurrentIndex(index - 1);
							return true;
						}
					});
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
