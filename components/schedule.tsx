import {
	Space,
	Table,
	Collapse,
	Tag,
	Switch,
	Skeleton,
	Button,
	List,
	Popconfirm,
	notification,
	Select,
	Divider,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import Link from 'next/link';
import useSWR from 'swr';
import { ResponseError, UserData } from '../types/database';
import { OrganizerScheduleDisplay, ScheduleDisplay, TeamSelectData } from '../types/client';
import { TeamData } from '../types/database';

const { Panel } = Collapse;
const { Option } = Select;

// const { JUDGING_LENGTH, NUM_ROOMS } = process.env;
const JUDGING_LENGTH = '1000';
const NUM_ROOMS = '5';
// const { Link } = Typography;

interface ScheduleProps {
	data: ScheduleDisplay[];
	cutoffIndex?: number;
}

// Data should include everything in ScheduleDisplay except for startTime and zoomURL
function TableCell(data: OrganizerScheduleDisplay | null) {
	return data ? (
		<Space direction="vertical">
			<Collapse ghost>
				<Panel header={<u>{data.teamName}</u>} key="info">
					<ul>
						<li key={`${data.teamName}-hackers`}>
							<span>Hackers: </span>
							{data.memberNames.map(name => (
								<Tag key={name}>{name}</Tag>
							))}
						</li>
						<li key={`${data.teamName}-devpost`}>
							Devpost <Link href={data.devpost}>link</Link>
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
	) : null;
}

// function useStickyState(defaultValue: ScheduleDisplay[], key: string) {
// 	const [value, setValue] = useState(defaultValue);

// 	useEffect(() => {
// 		const stickyValue = window.localStorage.getItem(key);

// 		if (stickyValue !== null) {
// 			setValue(JSON.parse(stickyValue));
// 		}
// 	}, [key]);

// 	useEffect(() => {
// 		window.localStorage.setItem(key, JSON.stringify(value));
// 	}, [key, value]);

// 	return { value, setValue };
// }
// function executeFunction(instruction, setter) {
// 	setter();
// }

// function Instruction() {
// 	return <span></span>;
// }
// function ScheduleManager(onStart, onSubmit, onCancel) {
// const

// return <Button>Hello</Button>;
// const [instructions, setInstructions] = useState([]);
// const data = ['hello', 'hello1', 'hello2'];
// return (
// 	<>
// 		<Space direction="vertical" style={{ width: '100%' }}>
// 			<List
// 				header={<div>Header</div>}
// 				footer={<div>Footer</div>}
// 				bordered
// 				dataSource={data}
// 				renderItem={item => <List.Item>{item}</List.Item>}
// 			/>
// 			<Button>Hello</Button>
// 		</Space>
// 	</>
// );
// }

// function handleSubmitEdit() {
// return true;
// }

enum EditingStates {
	NotEditing = 'NOT_EDITING',
	Accept = 'ACCEPT',
	Reject = 'REJECT',
}

export default function OrganizerSchedule(props: ScheduleProps) {
	const { data: originalData } = props;
	const [workingData, setWorkingData] = useState(originalData);
	const judgingLength = parseInt(JUDGING_LENGTH || '600000');
	const numRooms = parseInt(NUM_ROOMS || '5');
	const [editingState, setEditingState] = useState(EditingStates.NotEditing);

	const { data: judgesData, error: judgesError } = useSWR('/api/users?usertype=JUDGE', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as UserData[];
	});
	const { data: teamsData, error: teamsError } = useSWR('/api/teams', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of teams.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as TeamData[];
	});

	// const { value: data, setValue: setStickyData } = useStickyState(data, 'judgingState');
	const rooms = useMemo(
		() =>
			Array(numRooms)
				.fill(null)
				.map((_, i) => `vhl.ink/room-${i + 1}`),
		[numRooms]
	);
	const columns = useMemo(
		() => [
			{
				title: 'Time',
				dataIndex: 'time',
				key: 'time',
				width: 100,
				render: (time: string) => DateTime.fromISO(time).toLocaleString(DateTime.TIME_SIMPLE),
			},
			...rooms.map((roomURL, roomNum) => ({
				title: <a href={roomURL}>Room {roomNum + 1}</a>,
				dataIndex: roomURL,
				key: (roomNum + 1).toString(),
				render:
					editingState === EditingStates.NotEditing
						? TableCell
						: (data: ScheduleDisplay | null) => {
								// console.log('TEAMS:', teams);
								return (
									<Space direction="vertical" style={{ width: '100%' }}>
										Team:
										<Select
											style={{ width: '100%' }}
											onChange={stuff => console.log(stuff)}
											value={data?.teamId}>
											{teamsData?.map(team => (
												<Option key={team._id.toString()} value={team._id.toString()}>
													{team.name}
												</Option>
											))}
										</Select>
										Judges:
										<Select
											mode="multiple"
											style={{ width: '100%' }}
											onChange={stuff => console.log(stuff)}>
											{judgesData?.map(judge => (
												<Option key={judge._id.toString()} value={judge._id.toString()}>
													{judge.name}
												</Option>
											))}
										</Select>
									</Space>
								);
						  },
			})),
		],
		[rooms, editingState]
	);
	// Reorganize data to be fed into table
	const tableData = useMemo(() => {
		const dataAsMap = new Map();
		workingData.forEach(assignment => {
			const { time, zoom } = assignment;
			if (!dataAsMap.has(time)) {
				dataAsMap.set(time, Object.fromEntries(rooms.map(room => [room, null])));
			}
			dataAsMap.get(time)[zoom] = assignment;
		});
		return [...dataAsMap.entries()].map(pair => ({
			time: pair[0],
			...pair[1],
		}));
	}, [workingData, rooms]);

	// Pools of data for if editing is happening.

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
					{/* <Table.Summary.Row style={editingStyles[editingState]}> */}
					<Table.Summary.Row>
						<Table.Summary.Cell index={0} colSpan={100}>
							<Space direction="vertical">
								{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
								<a href="/api/export-schedule" target="_blank" download>
									<strong>Export schedule</strong>
								</a>
								{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
								<a href="/api/export-schedule-detailed" target="_blank" download>
									<strong>Export detailed schedule</strong>
								</a>
							</Space>
						</Table.Summary.Cell>
					</Table.Summary.Row>
				</Table.Summary>
			)}
		/>
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
			render: (date: string) => DateTime.fromISO(date).toLocaleString(DateTime.TIME_SIMPLE),
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
			title: 'Judging Form',
			dataIndex: 'form',
			key: 'form',
			render: (id: string) => (
				<Link href={`/judging?id=${id}`} passHref>
					<Button type="link">Go to form</Button>
				</Link>
			),
		},
		{
			title: 'Room',
			dataIndex: 'room',
			key: 'room',
			render: (link: URL) => (
				<Link href={link} passHref>
					<Button type="link">Join room</Button>
				</Link>
			),
		},
	];
	const dataSource = data.slice(showPast ? 0 : cutoffIndex).map(item => ({
		time: item.time,
		project: { name: item.teamName, link: new URL(item.devpost) },
		teamMembers: item.memberNames,
		judges: item.judgeNames,
		form: item.teamId,
		room: item.zoom,
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
