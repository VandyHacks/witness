import { Skeleton } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { signIn, signOut, useSession } from 'next-auth/react';
import SignIn from '../components/signIn';
import HackerDash from './HackerDash';
import JudgeDash from './JudgeDash';
import OrganizerDash from './OrganizerDash';
import useSWR from 'swr';
import { ApplicationStatus, UserData } from '../types/database';
import { Dispatch, SetStateAction, useState } from 'react';

export default function Page() {
	const { data: session, status } = useSession();
	const [submitted, setSubmitted] = useState(false);
	const { data: user } = useSWR('/api/user-data', async url => {
		const res = await fetch(url, { method: 'GET' });
		return (await res.json()) as UserData;
	});

	return (
		<Content
			style={{
				padding: '30px',
				backgroundImage: `${session && session.userType === 'HACKER' ? 'url(form-background.png)' : ''}`,
				backgroundRepeat: 'no-repeat',
				backgroundPosition: `${user?.applicationStatus === ApplicationStatus.SUBMITTED ? 'center' : 'top'}`,
				backgroundSize: 'cover',
				height: `${user?.applicationStatus === ApplicationStatus.SUBMITTED ? '100vh' : '100%'}`,
			}}
		>
			{!session && status === 'unauthenticated' && (
				<>
					Not signed in <br />
					<button onClick={() => signIn()}>Sign in</button>
				</>
			)}
			{!session && status === 'loading' && <Skeleton />}
			{session && (
				<>
					Signed in as {session.user?.email} <br />
					<button onClick={() => signOut()}>Sign out</button> <br />
					<br />
					{session.userType === 'HACKER' && <HackerDash user={user} />}
					{session.userType === 'JUDGE' && <JudgeDash />}
					{session.userType === 'ORGANIZER' && <OrganizerDash />}
				</>
			)}
		</Content>
	);
}
