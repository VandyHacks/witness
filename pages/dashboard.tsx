import { Alert, Divider, Skeleton } from 'antd';
import React from 'react';
import useSWR from 'swr';
import { Current, UpNext } from '../components/scheduleItem';
import Outline from '../components/outline';
import Schedule from '../components/schedule';
import { ScheduleData } from './api/schedule';

// TODO: stub
const userID = '0';
const userType = 'JUDGE';

function getUpNext(schedule: ScheduleData[]): ScheduleData | undefined {
	// TODO: currently only configured for judge. Should do for user.
	const now = new Date().getTime();
	let myJudgingSession;
	schedule.some(judgingSession => {
		// TODO: judges is hard coded.
		if (judgingSession.startTime > now && judgingSession['judges'].map(person => person.id).includes(userID)) {
			console.log('HERE!', judgingSession.startTime);
			myJudgingSession = judgingSession;
			return true;
		}
	});
	return myJudgingSession;
}

export default function Dashboard() {
	const { data: scheduleData, error: scheduleError } = useSWR('/api/schedule', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) throw new Error('Failed to get list of teams.');
		return (await res.json()) as ScheduleData[];
	});

	let pageContent;
	if (scheduleError) {
		pageContent = (
			<Alert
				message="An unknown error has occured. Please try again or reach out to an organizer."
				type="error"
			/>
		);
	} else if (!scheduleData) {
		pageContent = <Skeleton />;
	} else {
		const nextJudgingSession = getUpNext(scheduleData);

		pageContent = (
			<>
				<UpNext {...(nextJudgingSession as ScheduleData)} />
				<Divider>Schedule</Divider>
				{/* <Schedule data={scheduleData} /> */}
			</>
		);
	}
	// const scheduleData = getSchedule();
	return (
		<Outline>
			<h1>Dashboard</h1>
			{pageContent}
		</Outline>
	);
}

{
	/* <p>Use client-side data fetching to determine whether to show admin / judge / hacker views.</p>
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
			<p>Only organizers get complete table of all hackers with comments and everything.</p> */
}
