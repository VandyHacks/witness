import { Space, Tabs } from 'antd';
import { useContext, useEffect } from 'react';
import { UserData } from '../../types/database';
import { signOut, useSession } from 'next-auth/react';
import ThemeControl from '../Organizer/SettingsTab/ThemeControl';
import { AccentColor, getAccentColor, getThemedClass, Theme, ThemeContext } from '../../theme/themeProvider';
import styles from '../../styles/Judge.module.css';
import Link from 'next/link';
import { BugOutlined } from '@ant-design/icons';
import { useCustomSWR, RequestType } from '../../utils/request-utils';
import { AssignedTab } from './AssignedTab/AssignedTab';
import { AllTeamsTab } from './AllTeamsTab/AllTeamsTab';

export default function JudgeDash() {
	const { data: session, status } = useSession();

	const { baseTheme, accentColor, setAccentColor, setBaseTheme } = useContext(ThemeContext);

	// User data
	const { data: userData, error: judgeError } = useCustomSWR<UserData>({
		url: '/api/user-data',
		method: RequestType.GET,
		errorMessage: 'Failed to get judge object.',
	});

	// Set theme
	useEffect(() => {
		if (userData && userData.settings && userData.settings.accentColor && userData.settings.baseTheme) {
			setAccentColor(userData.settings.accentColor as AccentColor);
			setBaseTheme(userData.settings.baseTheme as Theme);
		}

		if (judgeError) {
			setAccentColor(AccentColor.MONOCHROME);
			setBaseTheme(Theme.DARK);
		}
	}, [userData, setAccentColor, setBaseTheme, judgeError]);

	return (
		<div>
			<div className={styles[getThemedClass('judgeHeader', baseTheme)]}>
				<h1 className={styles[getThemedClass('judgeTitle', baseTheme)]}>Judging Dashboard</h1>
				<div className={styles[getThemedClass('judgeHeaderEmail', baseTheme)]}>
					<div className={styles[getThemedClass('judgeHeaderEmailText', baseTheme)]}>
						{session?.user?.email}
					</div>
					<div>
						<button
							className={styles[getThemedClass('judgeButton', baseTheme)]}
							style={{
								backgroundColor: getAccentColor(accentColor, baseTheme),
							}}
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
						width: '95vw',
					}}
					tabBarStyle={{
						fontFamily: 'Arial, sans-serif',
						fontWeight: 'bold',
					}}
					items={[
						{
							label: `Assigned`,
							key: '1',
							children: <AssignedTab />,
						},
						{
							label: `All Teams`,
							key: '2',
							children: <AllTeamsTab />,
						},
					]}
				/>
			</Space>
			<div className={styles['theme-control-container']}>
				<ThemeControl />
			</div>
			<div className={styles['reportABugContainer']}>
				<Link href="/report">
					<div className={styles['reportABugText']}>Report a bug!</div>
				</Link>
				<BugOutlined />
			</div>
		</div>
	);
}
