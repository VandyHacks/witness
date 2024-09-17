import { Skeleton, Space, Tabs } from 'antd';
import { signOut, useSession } from 'next-auth/react';
import ScheduleTab from './ScheduleTab/ScheduleTab';
import JudgingTab from './JudgingTab/JudgingTab';
import ManageUsersTab from './ManageUsersTab/ManageUsersTab';
import PreAddUsersTab from './PreAddUsersTab/PreAddUsersTab';
import ApplicantsTab from './ApplicantsTab/ApplicantsTab';
import EventsTab from './EventsTab/EventsTab';
import AnalyticsTab from './AnalyticsTab/AnalyticsTab';
import styles from '../../styles/Organizer.module.css';
import { AccentColor, Theme, ThemeContext, getAccentColor, getThemedClass } from '../../theme/themeProvider';
import { useContext, useEffect } from 'react';
import SettingsTab from './SettingsTab/SettingsTab';
import { RequestType, useCustomSWR } from '../../utils/request-utils';
import { UserData } from '../../types/database';
import BugReportsTab from './BugReportsTab/BugReportsTab';

export default function OrganizerDash() {
	// Get session data
	const { data: session, status } = useSession();
	const { accentColor, baseTheme, setAccentColor, setBaseTheme } = useContext(ThemeContext);

	// User data
	const { data: userData, error: hackersError } = useCustomSWR<UserData>({
		url: '/api/user-data',
		method: RequestType.GET,
		errorMessage: 'Failed to get user object.',
	});

	// Set theme
	useEffect(() => {
		if (userData && userData.settings && userData.settings.accentColor && userData.settings.baseTheme) {
			setAccentColor(userData.settings.accentColor as AccentColor);
			setBaseTheme(userData.settings.baseTheme as Theme);
		}

		if (hackersError) {
			setAccentColor(AccentColor.MONOCHROME);
			setBaseTheme(Theme.DARK);
		}
	}, [userData, setAccentColor, setBaseTheme, hackersError]);

	if (!userData) return <Skeleton />;

	return (
		<div>
			<div className={styles[getThemedClass('organizerHeader', baseTheme)]}>
				<h1 className={styles[getThemedClass('organizerTitle', baseTheme)]}>Organizer Dashboard</h1>
				<div className={styles[getThemedClass('organizerHeaderEmail', baseTheme)]}>
					<div className={styles[getThemedClass('organizerHeaderEmailText', baseTheme)]}>
						{session?.user?.email}
					</div>
					<div>
						<button
							className={styles[getThemedClass('organizerButton', baseTheme)]}
							style={{ backgroundColor: getAccentColor(accentColor, baseTheme) }}
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
						color: getAccentColor(accentColor, baseTheme),

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
							label: `Analytics`,
							key: '7',
							children: <AnalyticsTab />,
						},
						{
							label: 'Bug Reports',
							key: '8',
							children: <BugReportsTab />,
						},
						{
							label: `Settings`,
							key: '9',
							children: <SettingsTab />,
						},
					]}
				/>
			</Space>
		</div>
	);
}
