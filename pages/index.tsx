import { Skeleton } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { signIn, useSession } from 'next-auth/react';
import { useState } from 'react';
import SignIn from '../components/signIn';
import { ApplicationStatus } from '../types/database';
import HackerDash from './HackerDash';
import JudgeDash from './JudgeDash';
import OrganizerDash from './OrganizerDash';

export default function Page() {
	const { data: session, status } = useSession();
	const [userApplicationStatus, setUserApplicationStatus] = useState<number>(0);

	return (
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
	);
}
