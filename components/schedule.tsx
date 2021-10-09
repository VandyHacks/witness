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
	Upload,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import Link from 'next/link';
import useSWR from 'swr';
import { ResponseError, UserData } from '../types/database';
import { OrganizerScheduleDisplay, ScheduleDisplay, TeamSelectData } from '../types/client';
import { TeamData } from '../types/database';
import { UploadOutlined } from '@ant-design/icons';

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

enum EditingStates {
	NotEditing = 'NOT_EDITING',
	Accept = 'ACCEPT',
	Reject = 'REJECT',
}

function handleSuccess() {
	notification['success']({
		message: 'Successfully set schedul!',
		placement: 'bottomRight',
	});
}

function handleFailure(message: string) {
	notification['error']({
		message: 'Oops, something went wrong!',
		description: message,
		placement: 'bottomRight',
	});
}

export default function OrganizerSchedule(props: ScheduleProps) {
	const { data } = props;
	const numRooms = parseInt(NUM_ROOMS || '5');

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
				render: TableCell,
			})),
		],
		[rooms]
	);
	// Reorganize data to be fed into table
	const tableData = useMemo(() => {
		const dataAsMap = new Map();
		data.forEach(assignment => {
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
	}, [data, rooms]);

	const [uploadData, setUploadData] = useState<string | ArrayBuffer | null | undefined>('');
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
								<Upload
									name="file"
									accept=".csv"
									maxCount={1}
									onChange={async (info: any) => {
										if (info.file.status === 'done') {
											const reader = new FileReader();
											reader.onload = e => {
												setUploadData(e.target?.result);
											};
											reader.readAsText(info.file.originFileObj);
											const res = await fetch('/api/schedule', {
												method: 'PUT',
												body: uploadData as string,
											});
											if (res.ok) {
												handleSuccess();
											} else {
												handleFailure(await res.text());
											}
										}
									}}>
									<Button icon={<UploadOutlined />}>Click to Upload</Button>
								</Upload>
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
