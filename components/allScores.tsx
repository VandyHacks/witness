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
	Spin,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import Link from 'next/link';

import { OrganizerScheduleDisplay, ScheduleDisplay, TeamSelectData} from '../types/client';
import { TeamData, ScoreData, UserData } from '../types/database';
import { UploadOutlined } from '@ant-design/icons';
import team from '../models/team';
import { ExportToCsv } from 'export-to-csv';

// const { Panel } = Collapse;
// const { Option } = Select;

// // const { JUDGING_LENGTH, NUM_ROOMS } = process.env;
// const JUDGING_LENGTH = '1000';
// const NUM_ROOMS = '5';
// // const { Link } = Typography;

// interface ScheduleProps {
// 	data: ScheduleDisplay[];
// 	cutoffIndex?: number;
// }

// // Data should include everything in ScheduleDisplay except for startTime and zoomURL
// function TableCell(data: OrganizerScheduleDisplay | null) {
// 	return data ? (
// 		<Space direction="vertical">
// 			<Collapse ghost>
// 				<Panel header={<u>{data.teamName}</u>} key="info">
// 					<ul>
// 						<li key={`${data.teamName}-hackers`}>
// 							<span>Hackers: </span>
// 							{data.memberNames.map(name => (
// 								<Tag key={name}>{name}</Tag>
// 							))}
// 						</li>
// 						<li key={`${data.teamName}-devpost`}>
// 							Devpost <Link href={data.devpost}>link</Link>
// 						</li>
// 					</ul>
// 				</Panel>
// 			</Collapse>
// 			<div>
// 				<ul>
// 					<li>
// 						<span>Judges: </span>
// 						{data.judges.map(judge => (
// 							<Tag key={judge.id}>{judge.name}</Tag>
// 						))}
// 					</li>
// 				</ul>
// 			</div>
// 		</Space>
// 	) : null;
// }

// enum EditingStates {
// 	NotEditing = 'NOT_EDITING',
// 	Accept = 'ACCEPT',
// 	Reject = 'REJECT',
// }

// function handleSuccess() {
// 	notification['success']({
// 		message: (
// 			<span>
// 				Successfully set schedule!
// 				<br />
// 				Please refresh the page.
// 			</span>
// 		),
// 		placement: 'bottomRight',
// 	});
// }

// function handleFailure(message: string) {
// 	notification['error']({
// 		message: 'Oops, something went wrong!',
// 		description: message,
// 		placement: 'bottomRight',
// 		duration: null,
// 	});
// }

export interface AllScoresProps {
	// formData: JudgingFormFields;
	// isNewForm: boolean;
	// onSubmit: (value: JudgingFormFields) => Promise<void>;
	scoreData: ScoreData[];
	teamData: TeamData[];
	userData: UserData[];
}


const newCols = [
	{
	  title: 'Team',
	  dataIndex: 'team',
	  key: 'team',
	},
	{
		title: 'Judge',
		dataIndex: 'judge',
		key: 'judge',
	  },
	{
		title: 'Technical Ability',
		dataIndex: 'technicalAbility',
		key: 'technicalAbility',
	  },
	  {
	  title: 'Creativity',
	  dataIndex: 'creativity',
	  key: 'creativity',
	},
	{
		title: 'Utility',
		dataIndex: 'utility',
		key: 'utility',
	  },
	  {
		title: 'Presentation',
		dataIndex: 'presentation',
		key: 'presentation',
	  },
	  {
		title: 'Wow Factor',
		dataIndex: 'wowFactor',
		key: 'wowFactor',
	  },
	  {
		title: 'Comments',
		dataIndex: 'comments',
		key: 'comments',
	  },
	  {
		title: 'Feedback',
		dataIndex: 'feedback',
		key: 'feedback',
	  },
	
]

export const exportCSV : any = (work : any) => {
	const csvExporter = new ExportToCsv();
	csvExporter.generateCsv(work);
}

export default function allScores(props: AllScoresProps){
	let data = props;
	let work = data.scoreData.map(x => {
		let tempTeam = data.teamData[data.teamData.findIndex(p => p._id == x.team)]
		let tempJudge = data.userData[data.userData.findIndex(p => p._id == x.judge)]

		let teamName
		let judgeName
		if (typeof tempTeam !== 'undefined'){
			teamName = tempTeam.name
		}
		if (typeof tempJudge !== 'undefined'){
			judgeName = tempJudge.name
		}

		return {"technicalAbility": x.technicalAbility,
				"creativity": x.creativity,
				"utility": x.utility,
				"presentation": x.presentation,
				"wowFactor": x.wowFactor,
				"comments": x.comments,
				"feedback": x.feedback,
				"team": teamName,
				"judge": judgeName

		}})

	console.log(work)
	return(<>
	
	<Table dataSource = {work} columns = {newCols}></Table>
	<Button onClick={ () => {exportCSV(work)}}>Export</Button>
	 </>);
	// return(<div>HI</div>)
}

// export function OrganizerSchedule(props: ScheduleProps) {
// 	const { data } = props;
// 	const numRooms = parseInt(NUM_ROOMS || '5');

// 	// const { value: data, setValue: setStickyData } = useStickyState(data, 'judgingState');
// 	const rooms = useMemo(
// 		() =>
// 			Array(numRooms)
// 				.fill(null)
// 				.map((_, i) => `vhl.ink/room-${i + 1}`),
// 		[numRooms]
// 	);
// 	const columns = useMemo(
// 		() => [
// 			{
// 				title: 'Time',
// 				dataIndex: 'time',
// 				key: 'time',
// 				width: 100,
// 				render: (time: string) => DateTime.fromISO(time).toLocaleString(DateTime.TIME_SIMPLE),
// 			},
// 			...rooms.map((roomURL, roomNum) => ({
// 				title: <a href={roomURL}>Room {roomNum + 1}</a>,
// 				dataIndex: roomURL,
// 				key: (roomNum + 1).toString(),
// 				render: TableCell,
// 			})),
// 		],
// 		[rooms]
// 	);
// 	// Reorganize data to be fed into table
// 	const tableData = useMemo(() => {
// 		const dataAsMap = new Map();
// 		data.forEach(assignment => {
// 			const { time, zoom } = assignment;
// 			if (!dataAsMap.has(time)) {
// 				dataAsMap.set(time, Object.fromEntries(rooms.map(room => [room, null])));
// 			}
// 			dataAsMap.get(time)[zoom] = assignment;
// 		});
// 		return [...dataAsMap.entries()].map(pair => ({
// 			time: pair[0],
// 			...pair[1],
// 		}));
// 	}, [data, rooms]);

// 	const [loading, setLoading] = useState(false);
// 	return (
// 		<Table
// 			dataSource={tableData}
// 			columns={columns}
// 			pagination={false}
// 			sticky
// 			bordered
// 			scroll={{ x: true }}
// 			summary={_ => (
// 				<Table.Summary fixed={true}>
// 					{/* <Table.Summary.Row style={editingStyles[editingState]}> */}
// 					<Table.Summary.Row>
// 						<Table.Summary.Cell index={0} colSpan={100}>
// 							<Space direction="vertical">
// 								{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
// 								<a href="/api/export-schedule" target="_blank" download>
// 									<strong>Export schedule</strong>
// 								</a>
// 								{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
// 								<a href="/api/export-schedule-detailed" target="_blank" download>
// 									<strong>Export detailed schedule</strong>
// 								</a>
// 								<Upload
// 									disabled={loading}
// 									name="file"
// 									accept=".csv"
// 									maxCount={1}
// 									onChange={async (info: any) => {
// 										const reader = new FileReader();
// 										let uploadData: string | ArrayBuffer | null | undefined = '';
// 										reader.onload = async e => {
// 											uploadData = e.target?.result;
// 											setLoading(true);
// 											const res = await fetch('/api/schedule', {
// 												method: 'PUT',
// 												body: uploadData as string,
// 											});
// 											setLoading(false);
// 											if (res.ok) {
// 												handleSuccess();
// 											} else {
// 												handleFailure(await res.text());
// 											}
// 										};
// 										if (info.file.status === 'done') {
// 											reader.readAsText(info.file.originFileObj);
// 										}
// 									}}>
// 									<Button icon={<UploadOutlined />}>
// 										<Space style={{ marginLeft: '10px' }}>
// 											Click to Upload {loading && <Spin size="small" />}
// 										</Space>
// 									</Button>
// 								</Upload>
// 							</Space>
// 						</Table.Summary.Cell>
// 					</Table.Summary.Row>
// 				</Table.Summary>
// 			)}
// 		/>
// 	);
// }

// export function JudgeSchedule({ data, cutoffIndex }: ScheduleProps) {
// 	const [showPast, setShowPast] = useState(false);
// 	let key = 0;
// 	const columns = [
// 		{
// 			title: 'Time',
// 			dataIndex: 'time',
// 			key: 'time',
// 			width: 100,
// 			render: (date: string) => DateTime.fromISO(date).toLocaleString(DateTime.TIME_SIMPLE),
// 		},
// 		{
// 			title: 'Project',
// 			dataIndex: 'project',
// 			key: 'project',
// 			render: ({ name, link }: { name: string; link: URL }) => (
// 				<Link href={link} passHref>
// 					<Button type="link">{name}</Button>
// 				</Link>
// 			),
// 		},
// 		{
// 			title: 'Team Members',
// 			dataIndex: 'teamMembers',
// 			key: 'teamMembers',
// 			render: (members: string[]) => members.map(member => <Tag key={member + key++}>{member}</Tag>),
// 		},
// 		{
// 			title: 'Judges',
// 			dataIndex: 'judges',
// 			key: 'judges',
// 			render: (judges: string[]) => judges.map(judge => <Tag key={judge + key++}>{judge}</Tag>),
// 		},
// 		{
// 			title: 'Judging Form',
// 			dataIndex: 'form',
// 			key: 'form',
// 			render: (id: string) => (
// 				<Link href={`/judging?id=${id}`} passHref>
// 					<Button type="link">Go to form</Button>
// 				</Link>
// 			),
// 		},
// 		{
// 			title: 'Room',
// 			dataIndex: 'room',
// 			key: 'room',
// 			render: (link: URL) => (
// 				<Link href={link} passHref>
// 					<Button type="link">Join room</Button>
// 				</Link>
// 			),
// 		},
// 	];
// 	const dataSource = data.slice(showPast ? 0 : cutoffIndex).map(item => ({
// 		time: item.time,
// 		project: { name: item.teamName, link: new URL(item.devpost) },
// 		teamMembers: item.memberNames,
// 		judges: item.judgeNames,
// 		form: item.teamId,
// 		room: item.zoom,
// 	}));
// 	return (
// 		<Table
// 			dataSource={dataSource}
// 			columns={columns}
// 			pagination={false}
// 			sticky
// 			bordered
// 			scroll={{ x: true }}
// 			summary={_ => (
// 				<Table.Summary fixed={true}>
// 					<Table.Summary.Row>
// 						<Table.Summary.Cell index={0} colSpan={5}>
// 							<Switch
// 								checkedChildren="Hide past sessions"
// 								unCheckedChildren="Include past sessions"
// 								onChange={checked => {
// 									setShowPast(checked);
// 								}}
// 							/>
// 						</Table.Summary.Cell>
// 					</Table.Summary.Row>
// 				</Table.Summary>
// 			)}
// 		/>
// 	);
// }
