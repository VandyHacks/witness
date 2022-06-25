import { Alert, Button } from 'antd';
import Link from 'next/link';
import React from 'react';

export default function ErrorMessage({ status }: { status: number }) {
	let message;
	switch (status) {
		case 403:
			message = '403: You are not permitted to access this content.';
			break;
		case 409:
			message = 'Click the "Team" tab on the menu bar to join or create a team!';
			break;
		case 418:
			message = (
				<p>
					Looks like you&apos;re lost in space! If you are a judge, please reach out to an organizer to
					register you. If you are a hacker, please make sure you log in with the same email and method (i.e.
					GitHub or Google) as you did for{' '}
					<Link href={'https://apply.vandyhacks.org'} passHref={true}>
						<Button type="link" style={{ padding: '0' }}>
							apply.vandyhacks.org
						</Button>
					</Link>
					.
				</p>
			);
			break;
		case 425:
			message = "Judging schedules aren't out yet — check back later!";
			break;
		default:
			message = 'An unknown error has occured. Please try again or reach out to an organizer.';
	}
	return <Alert message={message} type="error" />;
}
