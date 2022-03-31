import { Skeleton } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { signIn, signOut, useSession } from 'next-auth/react';
import ErrorMessage from '../components/errorMessage';
import HackerDash from './HackerDash';
import JudgeDash from './JudgeDash';
import OrganizerDash from './OrganizerDash';

export default function Page() {
	const { data: session, status } = useSession();

	return (
		<Content style={{ padding: '30px' }}>
			{ !session && status === "unauthenticated" && (
				<>
					Not signed in <br />
					<button onClick={() => signIn()}>Sign in</button>
				</>
			) }
			{ !session && status === "loading" && <Skeleton /> }
			{ session && (
				<>
					Signed in as {session.user?.email} <br />
					<button onClick={() => signOut()}>Sign out</button> <br /><br />
					{ !("userType" in session) && <ErrorMessage status={418} /> }
					{ session.userType === "HACKER" && <HackerDash /> }
					{ session.userType === "JUDGE" && <JudgeDash /> }
					{ session.userType === "ORGANIZER" && <OrganizerDash />  }
				</>
			) }
		</Content>
	);
}
