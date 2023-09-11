import { Button, Empty, Skeleton, Space, Tabs } from 'antd';
import { useSWRConfig } from 'swr';
import AllScores from '../../components/allScores';
import { ScoreData, TeamData, UserData } from '../../types/database';
import ApplicantsDisplay from '../../components/applicantsDisplay';
import Events from '../../components/events';
import { signOut, useSession } from 'next-auth/react';
import ScheduleTab from '../../components/Organizer/ScheduleTab/ScheduleTab';
import { RequestType, useCustomSWR } from '../../utils/request-utils';
import JudgingTab from '../../components/Organizer/JudgingTab/JudgingTab';
import ManageUsersTab from '../../components/Organizer/ManageUsersTab/ManageUsersTab';
import PreAddUsersTab from '../../components/Organizer/PreAddUsersTab/PreAddUsersTab';

export default function OrganizerDash() {
	const { mutate } = useSWRConfig();

	// Hacker data
	const { data: hackers, error: hackersError } = useCustomSWR<UserData>({
		url: '/api/users?usertype=HACKER',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of hackers.',
	});

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
							children: <PreAddUsersTab />
						},
						{
							label: `Manage Applications`,
							key: '5',
							children: <>{hackers && <ApplicantsDisplay hackers={hackers} />}</>,
						},
						{
							label: `Events`,
							key: '6',
							children: <Events />,
						},
					]}
				/>
			</Space>
		</>
	);
}
