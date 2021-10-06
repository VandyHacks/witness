import { Alert, Col, Divider, Row, Skeleton } from 'antd';
import React, { useState } from 'react';
import useSWR from 'swr';
import { AllDone, Current, UpNext } from '../components/scheduleItem';
import Outline from '../components/outline';
import Schedule from '../components/schedule';
import { ScheduleData } from './api/schedule';
import { ResponseError } from '../types/types';
import { signIn, useSession } from 'next-auth/client';

// TODO: stub
const userID = '0';
const userType = 'JUDGE';

export const judgingLength = 600000;

// TODO: this is horribly inefficient right now, as it checks through the whole dataset on every update
// request. Rewrite this to use the restructured dataset in schedule.tsx.
function getScheduleItem(type: 'current' | 'next', schedule: ScheduleData[]): ScheduleData {
	// TODO: currently only configured for judge. Should do for user.
	const now = new Date().getTime();
	let myJudgingSession = {
		startTime: -1,
		projectName: '',
		members: [{ id: '', name: '' }],
		judges: [{ id: '', name: '' }],
		devpostURL: '',
		zoomURL: '',
	};
	schedule.some(judgingSession => {
		// TODO: judges is hard coded.
		if (
			((type === 'next' && judgingSession.startTime > now) ||
				(type === 'current' &&
					judgingSession.startTime + judgingLength > now &&
					judgingSession.startTime < now)) &&
			judgingSession['judges'].map(person => person.id).includes(userID)
		) {
			myJudgingSession = judgingSession;
			return true;
		}
	});
	return myJudgingSession;
}

export default function Dashboard() {
	const [session, loading] = useSession();
	const { data: scheduleData, error: scheduleError } = useSWR('/api/schedule', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as ScheduleData[];
	});

	const [nextJudgingSession, setNextJudgingSession] = useState<ScheduleData | undefined>(undefined);
	const [currentJudgingSession, setCurrentJudgingSession] = useState<ScheduleData | undefined>(undefined);

	if (!loading && !session) return signIn();
	let pageContent;
	if (scheduleError) {
		pageContent = (
			<Alert
				message={
					scheduleError.status === 403
						? '403: You are not permitted to access this content.'
						: 'An unknown error has occured. Please try again or reach out to an organizer.'
				}
				type="error"
			/>
		);
	} else if (!scheduleData) {
		pageContent = <Skeleton />;
	} else {
		let cards;
		if (currentJudgingSession === undefined || nextJudgingSession === undefined) {
			cards = <Skeleton />;
		} else if (currentJudgingSession.startTime === -1 && nextJudgingSession.startTime === -1) {
			cards = <AllDone />;
		} else {
			cards = (
				<Row gutter={16}>
					{currentJudgingSession.startTime > -1 && (
						<Col className="gutter-row" flex={1}>
							<Current {...currentJudgingSession} />
						</Col>
					)}
					{nextJudgingSession.startTime > -1 && (
						<Col className="gutter-row" flex={1}>
							<UpNext {...nextJudgingSession} />
						</Col>
					)}
				</Row>
			);
		}
		pageContent = (
			<>
				{cards}
				<Divider>Schedule</Divider>
				<Schedule
					data={scheduleData}
					onScheduleAdvance={() => {
						setNextJudgingSession(getScheduleItem('next', scheduleData));
						setCurrentJudgingSession(getScheduleItem('current', scheduleData));
					}}
				/>
			</>
		);
	}
	return (
		<Outline>
			<h1>Dashboard</h1>
			<p>Signed in as {session?.user?.email}</p>
			{pageContent}
		</Outline>
	);
}
