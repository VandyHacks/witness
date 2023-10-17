import { Space, Table, Collapse, Tag, Switch, Button, notification, Upload, Spin } from 'antd';
import React, { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { JudgingSessionData } from '../../types/database';
import { User } from 'next-auth';

interface ScheduleProps {
	data: JudgingSessionData[];
	cutoffIndex?: number;
	handleChange: (teamId: string) => void;
	sessionTimeStart?: Date;
	sessionTimeEnd?: Date;
}

// Data should include everything in ScheduleDisplay except for startTime and zoomURL
function TableCell(data: JudgingSessionData | null) {
	return data
		? {
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

export function generateTimes(start: Date, end: Date, interval: number) {
	const times = [];
	let current = start;
	while (current < end) {
		times.push(current);
		current = new Date(current.getTime() + interval * 60000);
	}
	return times;
}

export default function OrganizerSchedule(props: ScheduleProps) {
	let { data, sessionTimeStart, sessionTimeEnd } = props;

	const teams = useMemo(
		() => [...new Set(data.filter(x => x.team !== null && x.team.name !== null).map(x => x.team.name))],
		[data]
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
			...teams.map(teamName => {
				let locationNum = data
					.filter(x => x.team !== null && x.team.name !== null)
					.find(x => x.team.name === teamName)?.team.locationNum;
				return {
					title: (teamName as string) + ' (Table ' + locationNum + ')',
					dataIndex: teamName as string,
					key: teamName as string,
					render: TableCell,
                    locationNum: locationNum,
				};
			}).sort((a, b) => (a.locationNum as number) - (b.locationNum as number)),
		],
		[teams, data]
	);

	sessionTimeStart = sessionTimeStart || new Date();
	sessionTimeEnd = sessionTimeEnd || new Date();
	const sessionTimes = generateTimes(sessionTimeStart, sessionTimeEnd, 10);

	// Reorganize data to be fed into table
	const tableData = useMemo(() => {
		const dataAsMap = new Map();
		sessionTimes.forEach(time => {
			dataAsMap.set(time.toISOString(), Object.fromEntries(teams.map(team => [team, null])));
		});

		// console.log(dataAsMap);
		data.forEach(session => {
			const { time, team } = session;
			if (!dataAsMap.has(time)) {
				dataAsMap.set(time, Object.fromEntries(teams.map(team => [team, null])));
			}

			// this is bad bad
			dataAsMap.get(time)[(team?.name as string) || ''] = session;
		});
		return [...dataAsMap.entries()].map(pair => ({
			time: pair[0],
			...pair[1],
			key: pair[0],
		}));
	}, [data, teams, sessionTimes]);

	const [loading, setLoading] = useState(false);
	return (
		<div style={{ width: '95vw' }}>
			<Table
				dataSource={tableData}
				columns={columns}
				pagination={false}
				sticky
				bordered
				scroll={{ x: 'max-content' }}
				// TODO: convert export schedule to use /api/judging-sessions instead of /api/schedule
				/*
				summary={_ => (
					<Table.Summary fixed={true}>
						<Table.Summary.Row>
							<Table.Summary.Cell index={0} colSpan={100}>
								<Space direction="vertical">
									<a href="/api/export-schedule" target="_blank" download>
										<strong>Export schedule</strong>
									</a>
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
				)}*/
			/>
		</div>
	);
}

export function JudgeSchedule({ data, cutoffIndex, handleChange }: ScheduleProps) {
	const [showPast, setShowPast] = useState(false);
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
			render: ({ name, link, locationNum }: { name: string; link: URL; locationNum: number }) => (
				<>
					<td>
						{name} (Table {locationNum})
					</td>
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
			title: 'Judge',
			dataIndex: 'judge',
			key: 'judge',
			render: (judge: User) => <Tag key={judge.id}>{judge.name}</Tag>,
		},
		{
			title: 'Action',
			dataIndex: 'teamId',
			key: 'teamId',
			render: (teamId: any) => (
				<Button type="primary" onClick={() => handleChange(teamId)}>
					Judge Team
				</Button>
			),
		},
	];
	const dataSource = data.slice(showPast ? 0 : cutoffIndex).map(item => {
		return {
			time: item.time,
			project: { name: item.team.name, link: new URL(item.team.devpost), locationNum: item.team.locationNum },
			teamMembers: item.team.members,
			judge: item.judge,
			teamId: item.team._id,
		};
	});

	return (
		<Table
			locale={{
				emptyText: (
					<div style={{ paddingTop: '50px', paddingBottom: '50px' }}>
						<h3>Stay tuned! You will see your teams that you will judge soon!</h3>
					</div>
				),
			}}
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
