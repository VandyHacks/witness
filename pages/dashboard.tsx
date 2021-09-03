import { Table } from 'antd';
import React from 'react';
import OnDeck from '../components/onDeck';
import Outline from '../components/outline';

const dataSource = [
	{
		key: '1',
		name: 'Mike',
		age: 32,
		address: '10 Downing Street',
	},
	{
		key: '2',
		name: 'John',
		age: 42,
		address: '10 Downing Street',
	},
];

const columns = [
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name',
	},
	{
		title: 'Age',
		dataIndex: 'age',
		key: 'age',
	},
	{
		title: 'Address',
		dataIndex: 'address',
		key: 'address',
	},
];

const myTeam = {
	projectName: 'witness',
	members: ['John Aden', 'Lassy Gableson', 'Arjun Kabaddi', 'Genevra Justins'],
	devpostURL: new URL('https://samlee.dev'),
};

const myJudges = ['Gretchen Miller', 'Abe Lichtenstein', 'Bob Jones'];

export default function Dashboard() {
	return (
		<Outline>
			<h1>Shared Dashboard</h1>
			<p>Use client-side data fetching to determine whether to show admin / judge / hacker views.</p>
			<p>
				Differences between judge and hacker views is hackers get to modify their project info (link Devpost).
				Judges just see the team / project info.
			</p>
			<p>
				Judges should also be able to create new score forms and view / edit all the ones they have already
				made.
			</p>
			<p>
				Both pages get a component that shows the master schedule, with the Zoom rooms relevant to them
				highlighted
			</p>
			<p>Also a link to the correct Zoom room (countdown timer during breaks)</p>
			<p>
				All Zoom rooms are open to all organizers at all times to monitor. Organizers should also be able to
				modify the schedule (swap teams, change timeslots, etc.)
			</p>
			<p>Only organizers get complete table of all hackers with comments and everything.</p>
			<OnDeck
				time={11111}
				projectName="witness"
				teamMembers={myTeam.members}
				devpostURL={myTeam.devpostURL}
				judges={myJudges}
				zoomURL={new URL('https://github.com')}
			/>
			{/* <Table dataSource={dataSource} columns={columns} />; */}
		</Outline>
	);
}
