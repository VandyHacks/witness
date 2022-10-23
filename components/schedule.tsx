import { Space, Table, Collapse, Tag, Switch, Button, notification, Upload, Spin } from 'antd';
import React, { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { OrganizerScheduleDisplay, ScheduleDisplay } from '../types/client';
import { UploadOutlined } from '@ant-design/icons';
import { JudgingSessionData } from '../types/database';
import { User } from 'next-auth';

const { Panel } = Collapse;

interface ScheduleProps {
	data: JudgingSessionData[];
	cutoffIndex?: number;
}

// Data should include everything in ScheduleDisplay except for startTime and zoomURL
function TableCell(data: JudgingSessionData | null) {
	return data
		? {
				props: {
					style: { background: '#fafafa' },
				},
				children: (
					<Space direction="vertical">
						{/* <Collapse ghost>
					<Panel header={<u>{data.teamName}</u>} key="info">
						<ul>
							<li key={`${data.teamName}-hackers`}>
								<span>Hackers: </span>
								{data.memberNames.map(name => (
									<Tag key={name}>{name}</Tag>
								))}
							</li>
							<li key={`${data.teamName}-devpost`}>
								<Link href={data.devpost}>
									<a style={{ color: '#1890ff' }} target="_blank">
										{' '}
										View Devpost
									</a>
								</Link>
							</li>
						</ul>
					</Panel>
				</Collapse> */}
						<div>
							{/* <span>Judge: </span> */}
							<Tag key={data.judge.name as string}>{data.judge.name}</Tag>
						</div>
					</Space>
				),
		  }
		: null;
}

enum EditingStates {
	NotEditing = 'NOT_EDITING',
	Accept = 'ACCEPT',
	Reject = 'REJECT',
}

function handleSuccess() {
	notification['success']({
		message: (
			<span>
				Successfully set schedule!
				<br />
				Please refresh the page.
			</span>
		),
		placement: 'bottomRight',
	});
}

function handleFailure(message: string) {
	notification['error']({
		message: 'Oops, something went wrong!',
		description: message,
		placement: 'bottomRight',
		duration: null,
	});
}

function generateTimes(start: Date, end: Date, interval: number) {
	const times = [];
	let current = start;
	while (current < end) {
		console.log(current);
		times.push(current);
		current = new Date(current.getTime() + interval * 60000);
	}
	return times;
}

export default function OrganizerSchedule(props: ScheduleProps) {
	let { data } = props;

	const teams = useMemo(() => [...new Set(data.map(x => x.team.name))], [data]);

	const columns = useMemo(
		() => [
			{
				title: 'Time',
				dataIndex: 'time',
				key: 'time',
				width: 100,
				render: (time: string) => DateTime.fromISO(time).toLocaleString(DateTime.TIME_SIMPLE),
			},
			...teams.map(teamName => ({
				title: teamName as string,
				dataIndex: teamName as string,
				key: teamName as string,
				render: TableCell,
			})),
		],
		[teams]
	);

	// 10:00 AM - 11:00 AM, 10 minute increments
	const sessionOne = generateTimes(new Date('2022-10-23T10:00:00'), new Date('2022-10-23T11:00:00'), 10);
	// 11:30 AM - 12:30 PM, 10 minute increments
	const sessionTwo = generateTimes(new Date('2022-10-23T11:30:00'), new Date('2022-10-23T12:30:00'), 10);

	// Reorganize data to be fed into table
	const tableData = useMemo(() => {
		const dataAsMap = new Map();
		sessionOne.forEach(time => {
			dataAsMap.set(time.toISOString(), Object.fromEntries(teams.map(team => [team, null])));
		});
		sessionTwo.forEach(time => {
			dataAsMap.set(time.toISOString(), Object.fromEntries(teams.map(team => [team, null])));
		});

		console.log(dataAsMap);
		data.forEach(session => {
			const { time, team } = session;
			if (!dataAsMap.has(time)) {
				dataAsMap.set(time, Object.fromEntries(teams.map(team => [team, null])));
			}
			dataAsMap.get(time)[team.name as string] = session;
		});
		return [...dataAsMap.entries()].map(pair => ({
			time: pair[0],
			...pair[1],
			key: pair[0],
		}));
	}, [data, teams, sessionOne, sessionTwo]);

	const [loading, setLoading] = useState(false);
	return (
		<Table
			dataSource={tableData}
			columns={columns}
			pagination={false}
			sticky
			bordered
			scroll={{ x: 'max-content' }}
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
									disabled={loading}
									name="file"
									accept=".csv"
									maxCount={1}
									action="/api/schedule"
									onChange={async (info: any) => {
										console.log(info);
										if (info.file.status == 'error') {
											handleFailure(info.file.response);
										} else if (info.file.status == 'done') {
											handleSuccess();
										}
									}}>
									<Button icon={<UploadOutlined />}>
										<Space style={{ marginLeft: '10px' }}>
											Click to Upload {loading && <Spin size="small" />}
										</Space>
									</Button>
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
				<>
					<td>{name}</td>
					<Link href={link} passHref>
						<a style={{ color: '#1890ff' }} target="_blank">
							Devpost
						</a>
					</Link>
				</>
			),
		},
		{
			title: 'Team Members',
			dataIndex: 'teamMembers',
			key: 'teamMembers',
			render: (members: User[]) => members.map(member => <Tag key={member.id}>{member.name}</Tag>),
		},
		{
			title: 'Judges',
			dataIndex: 'judge',
			key: 'judge',
			render: (judge: User) => <Tag key={judge.id}>{judge.name}</Tag>,
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
	];
	const dataSource = data.slice(showPast ? 0 : cutoffIndex).map(item => {
		console.log('this is item: ', item);
		return {
			time: item.time,
			project: { name: item.team.name, link: new URL(item.team.devpost) },
			teamMembers: item.team.members,
			judge: item.judge,
		};
	});

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
						<Table.Summary.Cell index={0} colSpan={6}>
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
