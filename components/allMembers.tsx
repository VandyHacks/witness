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
import { TeamData, UserData } from '../types/database';
import { UploadOutlined } from '@ant-design/icons';
import { ExportToCsv } from 'export-to-csv';

export interface AllMembersProps {
	userData: UserData[];
	teamData: TeamData[];
}



const cols = [
	{
	  title: 'Name',
	  dataIndex: 'name',
	  key: 'name',
	},
	{
	  title: 'joinCode',
	  dataIndex: 'joinCode',
	  key: 'joinCode',
	},
	{
	  title: 'devpost',
	  dataIndex: 'devpost',
	  key: 'devpost',
	}
]

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
		  	{members.map((member, i)=> {
				  return <div key = {i}>{member}</div>
			  })}
		  </>
	  )
	}
]

export const exportCSV : any = (work : any) => {
	const csvExporter = new ExportToCsv();
	csvExporter.generateCsv(work);
}

export default function allMembers(props: AllMembersProps){
	let data = props;

	console.log(data.teamData)
	console.log(data.userData)
	let work = data.teamData.map(x => {
		return {"name": x.name, "members": x.members.map((y,z) => {
			let temp = data.userData[data.userData.findIndex(p => p._id == x.members[z])]
			if (typeof temp !== 'undefined'){
				return temp.name;
			}
			else{
				return temp;
			}
		})
	}
})

	return(<>
	<Table dataSource = {work} columns = {newCols}></Table>
	<Button onClick={ () => {exportCSV(work)}}>Export</Button>
	</>);
	// return(<div>HI</div>)
}
