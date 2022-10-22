import { Button } from 'antd';
import { signOut } from 'next-auth/react';
import { useSession } from 'next-auth/react';

export default function Logout() {
	const { data: session } = useSession();

	return (
		<>
			<div style={{ paddingRight: '20px' }}>Signed in as {session!.user!.email}</div>
			<Button size="small" type="default" onClick={() => signOut()}>
				Sign out
			</Button>
		</>
	);
}
