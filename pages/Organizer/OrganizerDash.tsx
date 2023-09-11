import { Button, Space, Tabs } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import ScheduleTab from '../../components/Organizer/ScheduleTab/ScheduleTab';
import JudgingTab from '../../components/Organizer/JudgingTab/JudgingTab';
import ManageUsersTab from '../../components/Organizer/ManageUsersTab/ManageUsersTab';
import PreAddUsersTab from '../../components/Organizer/PreAddUsersTab/PreAddUsersTab';
import ApplicantsTab from '../../components/Organizer/ApplicantsTab/ApplicantsTab';
import EventsTab from '../../components/Organizer/EventsTab/EventsTab';

export default function OrganizerDash() {
	// Get session data
	const { data: session, status } = useSession();

	return (
		<>
			<div style={{ display: 'flex' }}>
				<Button size="small" type="default" onClick={() => signOut()}>
					Sign out
				</Button>
				<div style={{ paddingLeft: '10px' }}>Signed in as {session?.user?.email}</div>
			</div>
			<Space direction="vertical">
				<Tabs
					defaultActiveKey="1"
					items={[
						{
							label: `Schedule`,
							key: '1',
							children: <ScheduleTab />,
						},
						{
							label: `Judging`,
							key: '2',
							children: <JudgingTab />,
						},
						{
							label: `Manage Users`,
							key: '3',
							children: <ManageUsersTab />,
						},
						{
							label: `Pre-Add Users`,
							key: '4',
							children: <PreAddUsersTab />,
						},
						{
							label: `Manage Applications`,
							key: '5',
							children: <ApplicantsTab />,
						},
						{
							label: `Events`,
							key: '6',
							children: <EventsTab />,
						},
					]}
				/>
			</Space>
		</>
	);
}
