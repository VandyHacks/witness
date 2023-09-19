import { Space, Tabs } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import ScheduleTab from './ScheduleTab/ScheduleTab';
import JudgingTab from './JudgingTab/JudgingTab';
import ManageUsersTab from './ManageUsersTab/ManageUsersTab';
import PreAddUsersTab from './PreAddUsersTab/PreAddUsersTab';
import ApplicantsTab from './ApplicantsTab/ApplicantsTab';
import EventsTab from './EventsTab/EventsTab';
import styles from '../../styles/Organizer.module.css';
import { ThemeContext, getAccentColor, getThemedClass } from '../../theme/themeProvider';
import { useContext } from 'react';
import SettingsTab from './SettingsTab/SettingsTab';

export default function OrganizerDash() {
	// Get session data
	const { data: session, status } = useSession();
	const { accentColor, baseTheme } = useContext(ThemeContext);

	console.log(getThemedClass('organizerHeaderEmailText', baseTheme));

	return (
		<div className={styles[getThemedClass('organizerMain', baseTheme)]}>
			<div className={styles[getThemedClass('organizerHeader', baseTheme)]}>
				<h1 className={styles[getThemedClass('organizerTitle', baseTheme)]}>Organizer Dashboard</h1>
				<div className={styles[getThemedClass('organizerHeaderEmail', baseTheme)]}>
					<div className={styles[getThemedClass('organizerHeaderEmailText', baseTheme)]}>
						{session?.user?.email}
					</div>
					<div>
						<button
							className={styles[getThemedClass('organizerButton', baseTheme)]}
							onClick={() => signOut()}>
							Sign out
						</button>
					</div>
				</div>
			</div>
			<Space direction="vertical">
				<Tabs
					defaultActiveKey="1"
					style={{
						color: getAccentColor(accentColor),

						width: '90vw',
					}}
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
						{
							label: `Settings`,
							key: '7',
							children: <SettingsTab />,
						},
					]}
				/>
			</Space>
		</div>
	);
}
