import { signIn, signOut, useSession } from 'next-auth/react';
import Outline from '../components/outline';

export default function Page() {
	const { data: session, status } = useSession();
	const loading = status === 'loading';

	return (
		<Outline selectedKey="">
			{!session && (
				<>
					Not signed in <br />
					<button onClick={() => signIn()}>Sign in</button>
				</>
			)}
			{session && (
				<>
					Signed in as {session.user?.email} <br />
					<button onClick={() => signOut()}>Sign out</button>
				</>
			)}
		</Outline>
	);
}

export async function getStaticProps() {
	return {
		props: { title: 'Sign In' },
	};
}
