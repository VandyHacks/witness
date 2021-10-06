// import { signIn, signOut, useSession } from 'next-auth/client';
// import Outline from '../components/outline';

// export default function Page() {
// 	const [session, loading] = useSession();

// 	return (
// 		<Outline>
// 			{!session && (
// 				<>
// 					Not signed in <br />
// 					<button onClick={() => signIn()}>Sign in</button>
// 				</>
// 			)}
// 			{session && (
// 				<>
// 					Signed in as {session.user?.email} <br />
// 					<button onClick={() => signOut()}>Sign out</button>
// 				</>
// 			)}
// 		</Outline>
// 	);
// }
