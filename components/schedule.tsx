import { Space, Table, Collapse, Tag, Switch, Skeleton, Button, List, Popconfirm, notification, Select } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { ScheduleData } from '../pages/api/schedule';
import { DateTime } from 'luxon';
import Link from 'next/link';
import useSWR from 'swr';
import { ResponseError } from '../types/types';
import { TeamsData } from '../pages/api/team-select';

const { Panel } = Collapse;
const { Option } = Select;

// const { JUDGING_LENGTH, NUM_ROOMS } = process.env;
const JUDGING_LENGTH = '1000';
const NUM_ROOMS = '5';
// const { Link } = Typography;

interface ScheduleProps {
	data: ScheduleData[];
	cutoffIndex?: number;
	// onScheduleAdvance: () => void;
}

// Data should include everything in ScheduleData except for startTime and zoomURL
function TableCell(data: ScheduleData | null) {
	return data ? (
		<Space direction="vertical">
			<Collapse ghost>
				<Panel header={<u>{data.projectName}</u>} key="info">
					<ul>
						<li key={`${data.projectName}-hackers`}>
							<span>Hackers: </span>
							{data.members.map(member => (
								<Tag key={member}>{member}</Tag>
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
							<Tag key={judge}>{judge}</Tag>
						))}
					</li>
				</ul>
			</div>
		</Space>
	) : null;
}

// function useStickyState(defaultValue: ScheduleData[], key: string) {
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
function executeFunction(instruction, setter) {
	setter();
}

function Instruction() {
	return <span></span>;
}
function ScheduleManager(onStart, onSubmit, onCancel) {
	// const

	return <Button>Hello</Button>;
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
}

function handleSubmitEdit() {
	// return true;
}

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

	const { data: judges, error: judgesError } = useSWR('/api/need-to-implement', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as ScheduleData[];
	});

	const { data: teams, error: teamsError } = useSWR('/api/users', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as TeamsData[];
	});
	const [editingState, setEditingState] = useState(EditingStates.NotEditing);

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
				render: (timestamp: number) => DateTime.fromMillis(timestamp).toLocaleString(DateTime.TIME_SIMPLE),
			},
			...rooms.map((roomURL, roomNum) => ({
				title: <a href={roomURL}>Room {roomNum + 1}</a>,
				dataIndex: roomURL,
				key: (roomNum + 1).toString(),
				render:
					editingState === EditingStates.NotEditing
						? TableCell
						: (data: ScheduleData | null) => {
								// console.log('TEAMS:', teams);
								return (
									<Space direction="vertical" style={{ width: '100%' }}>
										Team:
										<Select
											placeholder="Please select favourite colors"
											style={{ width: '100%' }}
											onChange={stuff => console.log(stuff)}>
											{/* {teams!.map(team => (
												<Option key={team.teamID} value={team.projectName}>
													{team.projectName}
												</Option>
											))} */}
											<Option value="china">China</Option>
											<Option value="india">India</Option>
											<Option value="usa">USA</Option>
										</Select>
										Judges:
										<Select
											mode="multiple"
											placeholder="Please select favourite colors"
											style={{ width: '100%' }}
											onChange={stuff => console.log(stuff)}>
											<Option value="china">China</Option>
											<Option value="india">India</Option>
											<Option value="usa">USA</Option>
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
		workingData.forEach(judgingSession => {
			const { startTime, zoomURL } = judgingSession;
			if (!dataAsMap.has(startTime)) {
				dataAsMap.set(startTime, Object.fromEntries(rooms.map(room => [room, null])));
			}
			dataAsMap.get(startTime)[zoomURL] = judgingSession;
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
							{editingState === EditingStates.NotEditing ? (
								<Button
									type="primary"
									onClick={() => setEditingState(EditingStates.Accept)}
									loading={false /*!judges || !teams*/}>
									Edit Schedule
								</Button>
							) : (
								<Space direction="horizontal">
									<Popconfirm
										title="Discard changes?"
										onConfirm={() => {
											setEditingState(EditingStates.NotEditing);
											setWorkingData(originalData);
										}}
										okText="Yes"
										cancelText="No">
										<Button>Cancel</Button>
									</Popconfirm>
									<Popconfirm
										title="Save changes?"
										onConfirm={async () => {
											// const res = await handleSubmitEdit();
											// if (res.ok) {
											// 	setEditingState(EditingStates.NotEditing);
											// 	// setWorkingData(originalData);
											// } else {
											// 	notification['error']({
											// 		message: 'Error saving changes',
											// 		description: 'Oops', //res.message,
											// 		placement: 'bottomRight',
											// 	});
											// }
											setEditingState(EditingStates.NotEditing);
										}}
										okText="Yes"
										cancelText="No"
										disabled={editingState === EditingStates.Reject}>
										<Button type="primary" disabled={editingState === EditingStates.Reject}>
											Submit Changes
										</Button>
									</Popconfirm>
								</Space>
							)}
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
