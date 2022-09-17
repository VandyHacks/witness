import { Skeleton } from 'antd';
import { Content } from 'antd/lib/layout/layout';
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
				<title>VandyHacks IX</title>
				<meta property="og:title" content="VandyHacks IX" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://apply.vandyhacks.org" />
				<meta property="og:image" content="/vh.png" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@vandyhacks" />
				<meta name="twitter:creator" content="@vandyhacks" />
				<meta name="author" content="VandyHacks" />
				<meta name="description" content="Come join VH IX at Vanderbilt University on Oct 21-23, 2022. ✨" />
				<meta
					property="og:description"
					content="Come join VH IX at Vanderbilt University on Oct 21-23, 2022. ✨"
				/>
			</Head>
			<Content
				style={{
					padding: session ? '30px' : '0px',
					backgroundImage: `${session && session.userType === 'HACKER' ? 'url(form-background.png)' : ''}`,
					backgroundRepeat: 'no-repeat',
					backgroundPosition: `${userApplicationStatus === ApplicationStatus.SUBMITTED ? 'center' : 'top'}`,
					backgroundSize: 'cover',
					height: `${userApplicationStatus === ApplicationStatus.SUBMITTED ? '100vh' : '100%'}`,
				}}
			>
				{!session && status === 'unauthenticated' && <SignIn />}
				{!session && status === 'loading' && <Skeleton />}
				{session && (
					<>
						<br />
						{session.userType === 'HACKER' && (
							<HackerDash
								userApplicationStatus={userApplicationStatus}
								setUserApplicationStatus={setUserApplicationStatus}
								userEmail={session.user?.email}
							/>
						)}
						{session.userType === 'JUDGE' && <JudgeDash />}
						{session.userType === 'ORGANIZER' && <OrganizerDash />}
					</>
				)}
			</Content>
		</>
	);
}
