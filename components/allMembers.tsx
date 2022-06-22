import { Table, Tag, Button } from 'antd';
import React from 'react';

import { TeamData, UserData } from '../types/database';
import { ExportToCsv } from 'export-to-csv';

export interface AllMembersProps {
	userData: UserData[];
	teamData: TeamData[];
}

const newCols = [
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name',
	},
	{
		title: 'Members',
		dataIndex: 'members',
		key: 'members',
		render: (members: any[]) => (
			<>
				{members.map((member, i) => {
					return <Tag key={i}>{member}</Tag>;
				})}
			</>
		),
	},
];

export const exportCSV: any = (work: any) => {
	const csvExporter = new ExportToCsv();
	csvExporter.generateCsv(work);
};

export default function allMembers(props: AllMembersProps) {
	let data = props;
	let work = data.teamData.map(x => {
		return {
			name: x.name,
			members: x.members.map((y, z) => {
				let temp = data.userData[data.userData.findIndex(p => p._id == x.members[z])];
				if (typeof temp !== 'undefined') {
					return temp.name;
				} else {
					return temp;
				}
			}),
		};
	});

	return (
		<>
			<Table dataSource={work} columns={newCols}></Table>
			<Button
				onClick={() => {
					exportCSV(work);
				}}
			>
				Export
			</Button>
		</>
	);
}
