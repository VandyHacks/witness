import { Table, Tag, Button } from 'antd';
import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { JudgingSessionData } from '../../../types/database';
import { ThemeContext, getAccentColor } from '../../../theme/themeProvider';

interface ScheduleProps {
	data: JudgingSessionData[];
	TimeForJudgeToScoreOneTeam?: number;
	handleChange: (teamId: string) => void;
	sessionTimeStart?: Date;
	sessionTimeEnd?: Date;
}

export function JudgeSchedule({ data, handleChange }: ScheduleProps) {
	const [isJudged, setIsJudged] = useState(false);
	const { accentColor, baseTheme } = useContext(ThemeContext);

	const columns = [
		{
			title: 'Table',
			dataIndex: 'table',
			key: 'table',
			width: '20%',
			render: (locationNum: number) => locationNum,
		},
		{
			title: 'Project',
			dataIndex: 'project',
			key: 'project',
			width: '60%',
			render: ({ name, link }: { name: string; link: URL }) => (
				<>
					<td>{name}</td>
					<Link href={link} passHref>
						<a
							style={{ color: getAccentColor(accentColor, baseTheme), textDecoration: 'underline' }}
							target="_blank">
							Devpost
						</a>
					</Link>
				</>
			),
		},
		{
			title: 'Judgement State',
			dataIndex: 'haveJudged',
			key: 'haveJudged',
			width: '20%',
			render: (haveJudged: []) => <Tag>{haveJudged ? 'Judged' : 'Without Judgement'}</Tag>,
		},
	];

	const dataSource = data
		.filter(item => (isJudged ? item.haveJudged : !item.haveJudged))
		.map(item => ({
			table: item.team.locationNum,
			project: { name: item.team.name, link: new URL(item.team.devpost) },
			teamId: item.team._id,
			haveJudged: item.haveJudged,
		}));

	const handleRowClick = (record: any) => {
		handleChange(record.teamId);
	};

	return (
		<Table
			locale={{
				emptyText: (
					<div style={{ paddingTop: '50px', paddingBottom: '50px' }}>
						<h3>
							{data.length == 0
								? 'Stay tuned! You will see your teams that you will judge soon!'
								: isJudged
								? "You haven't started judging yet."
								: "Hurraaaaarrgh! You're off duty!"}
						</h3>
					</div>
				),
			}}
			dataSource={dataSource}
			columns={columns}
			pagination={false}
			bordered
			scroll={{ x: true }}
			summary={_ => (
				<Table.Summary fixed={true}>
					<Table.Summary.Row>
						<Table.Summary.Cell index={0} colSpan={6}>
							<Button type="primary" onClick={() => setIsJudged(!isJudged)} style={{ marginLeft: 8 }}>
								{isJudged ? 'Judged' : 'Without Judgement'}
							</Button>
						</Table.Summary.Cell>
					</Table.Summary.Row>
				</Table.Summary>
			)}
			onRow={record => ({
				onClick: () => handleRowClick(record),
			})}
		/>
	);
}
