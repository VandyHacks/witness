import { Layout, Skeleton } from 'antd';
import { signIn, useSession } from 'next-auth/react';
import { useState } from 'react';
import SignIn from '../components/signIn';
import { ApplicationStatus } from '../types/database';
import HackerDash from './HackerDash';
import JudgeDash from './JudgeDash';
import OrganizerDash from './OrganizerDash';
import Head from 'next/head';

export default function Page() {
	const { data: session, status } = useSession();
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
				<meta name="description" content="Come join VH X at Vanderbilt University on Oct 27-29, 2023. ✨" />
				<meta
					property="og:description"
					content="Come join VH X at Vanderbilt University on Oct 27-29, 2023. ✨"
				/>
			</Head>
			<Layout
				style={{
					padding: session?.userType === undefined || session?.userType === 'HACKER' ? '0px' : '30px',
					height: `100%`,
					width: `100vw`,
					backgroundColor: 'white',
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
						{session.userType === 'JUDGE' && <JudgeDash />}
						{session.userType === 'ORGANIZER' && <OrganizerDash />}
					</>
				)}
			</Layout>
		</>
	);
}
