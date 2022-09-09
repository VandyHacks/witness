import { Skeleton } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { signIn, signOut, useSession } from 'next-auth/react';
import SignIn from '../components/signIn';
import HackerDash from './HackerDash';
import JudgeDash from './JudgeDash';
import OrganizerDash from './OrganizerDash';

export default function Page() {
	const { data: session, status } = useSession();
	return (
		<Content
			style={{
				padding: session ? '30px' : '0px',
				backgroundImage: `${session && session.userType === 'HACKER' ? 'url(form-background.png)' : ''}`,
				backgroundRepeat: 'no-repeat',
				backgroundSize: 'cover',
			}}>
			{!session && status === 'unauthenticated' && <SignIn />}
			{!session && status === 'loading' && <Skeleton />}
			{session && (
				<>
					Signed in as {session.user?.email} <br />
					<button onClick={() => signOut()}>Sign out</button> <br />
					<br />
					{session.userType === 'HACKER' && <HackerDash />}
					{session.userType === 'JUDGE' && <JudgeDash />}
					{session.userType === 'ORGANIZER' && <OrganizerDash />}
				</>
			)}
		</Content>
	);
}
