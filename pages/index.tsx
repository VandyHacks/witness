import { Layout, Skeleton, ConfigProvider, theme } from 'antd';
import { useSession } from 'next-auth/react';
import { useContext, useState } from 'react';
import SignIn from '../components/signIn';
import HackerDash from '../components/hacker/HackerDash';
import JudgeDash from '../components/judges/JudgeDash';
import OrganizerDash from '../components/Organizer/OrganizerDash';
import Head from 'next/head';
import { Theme, ThemeContext, getAccentColor } from '../theme/themeProvider';
import { themeConstants } from '../theme/theme';

export default function Page() {
	const { data: session, status } = useSession();
	const { baseTheme, accentColor } = useContext(ThemeContext);
	const [userApplicationStatus, setUserApplicationStatus] = useState<number>(0);

	return (
		<>
			<Head>
				<title>VandyHacks X</title>
				<meta property="og:title" content="VandyHacks X" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://apply.vandyhacks.org" />
				<meta property="og:image" content="/vh.png" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@vandyhacks" />
				<meta name="twitter:creator" content="@vandyhacks" />
				<meta name="author" content="VandyHacks" />
				<meta name="description" content="Come join VH X at Vanderbilt University on Oct 28-29, 2023. ✨" />
				<meta
					property="og:description"
					content="Come join VH X at Vanderbilt University on Oct 28-29, 2023. ✨"
				/>
			</Head>
			<Layout
				style={{
					padding: session?.userType === undefined || session?.userType === 'HACKER' ? '0px' : '30px',
					height: `100vh`,
					width: `100vw`,
					overflow: 'auto',
					backgroundColor:
						session?.userType === undefined || session?.userType === 'HACKER'
							? 'white'
							: baseTheme === Theme.LIGHT
							? themeConstants.light.backgroundColor
							: themeConstants.dark.backgroundColor,
				}}>
				{!session && status === 'unauthenticated' && <SignIn />}
				{!session && status === 'loading' && <Skeleton />}
				{session && (
					<>
						{session.userType === 'HACKER' && (
							<HackerDash
								userApplicationStatus={userApplicationStatus}
								setUserApplicationStatus={setUserApplicationStatus}
							/>
						)}
						{session.userType === 'JUDGE' && (
							<ConfigProvider
								theme={{
									algorithm: [
										baseTheme === Theme.LIGHT ? theme.defaultAlgorithm : theme.darkAlgorithm,
										theme.compactAlgorithm,
									],
									token: {
										colorPrimary: getAccentColor(accentColor, baseTheme), // buttons, tab selected, on hover
										colorBgBase:
											baseTheme === Theme.LIGHT
												? themeConstants.light.backgroundColor
												: themeConstants.dark.backgroundColor, // backgrounds
									},
								}}>
								<JudgeDash />
							</ConfigProvider>
						)}
						{session.userType === 'ORGANIZER' && (
							<ConfigProvider
								theme={{
									algorithm: [
										baseTheme === Theme.LIGHT ? theme.defaultAlgorithm : theme.darkAlgorithm,
										theme.compactAlgorithm,
									],
									token: {
										colorPrimary: getAccentColor(accentColor, baseTheme), // buttons, tab selected, on hover
										colorBgBase:
											baseTheme === Theme.LIGHT
												? themeConstants.light.backgroundColor
												: themeConstants.dark.backgroundColor, // backgrounds
									},
								}}>
								<OrganizerDash />
							</ConfigProvider>
						)}
					</>
				)}
			</Layout>
		</>
	);
}
