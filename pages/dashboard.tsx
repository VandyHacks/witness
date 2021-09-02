import Outline from '../components/outline';

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
		</Outline>
	);
}
