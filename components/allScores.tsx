import { Table, Tag, Button } from 'antd';
import React from 'react';

import { TeamData, ScoreData, UserData } from '../types/database';
import { ExportToCsv } from 'export-to-csv';

export interface AllScoresProps {
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
		render: (tag: any) => <Tag>{tag}</Tag>,
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
];

export const exportCSV: any = (work: any) => {
	const csvExporter = new ExportToCsv();
	csvExporter.generateCsv(work);
};

export default function allScores(props: AllScoresProps) {
	let data = props;
	let work = data.scoreData.map(x => {
		let tempTeam = data.teamData[data.teamData.findIndex(p => p._id == x.team)];
		let tempJudge = data.userData[data.userData.findIndex(p => p._id == x.judge)];

		let teamName;
		let judgeName;
		if (typeof tempTeam !== 'undefined') {
			teamName = tempTeam.name;
		}
		if (typeof tempJudge !== 'undefined') {
			judgeName = tempJudge.name;
		}

		return {
			technicalAbility: x.technicalAbility,
			creativity: x.creativity,
			utility: x.utility,
			presentation: x.presentation,
			wowFactor: x.wowFactor,
			comments: x.comments,
			feedback: x.feedback,
			team: teamName,
			judge: judgeName,
		};
	});

	console.log(work);
	return (
		<>
			<Table dataSource={work} columns={newCols}></Table>
			<Button
				onClick={() => {
					exportCSV(work);
				}}>
				Export
			</Button>
		</>
	);
}
