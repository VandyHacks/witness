import { Alert, Button, Col, Divider, Row, Skeleton, Timeline } from 'antd';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
// import { AllDone, Current, UpNext } from '../components/scheduleItem';
import Outline from '../components/outline';
import OrganizerSchedule, { JudgeSchedule } from '../components/schedule';
import Cards from '../components/cards';
import { ScheduleDisplay } from '../types/client';
import { ResponseError } from '../types/database';
import { signIn, useSession } from 'next-auth/client';
import schedule from '../models/schedule';
import Link from 'next/link';
import ErrorMessage from '../components/errorMessage';

// TODO: stub
const userID = '0';
const userType = 'JUDGE';

// let { JUDGING_LENGTH } = process.env;
const JUDGING_LENGTH = '600000';

// TODO: this is horribly inefficient right now, as it checks through the whole dataset on every update
// request. Rewrite this to use the restructured dataset in schedule.tsx.
// function getScheduleItem(type: 'current' | 'next', schedule: ScheduleDisplay[]): ScheduleDisplay {
// 	// TODO: currently only configured for judge. Should do for user.
// 	const now = new Date().getTime();
// 	let myScheduleItem = {
// 		time: -1,
// 		projectName: '',
// 		members: [{ id: '', name: '' }],
// 		judges: [{ id: '', name: '' }],
// 		devpostURL: '',
// 		zoomURL: '',
// 	};
// 	schedule.some(ScheduleItem => {
// 		// TODO: judges is hard coded.
// 		if (
// 			((type === 'next' && ScheduleItem.time > now) ||
// 				(type === 'current' &&
// 					ScheduleItem.time + judgingLength > now &&
// 					ScheduleItem.time < now)) &&
// 			ScheduleItem['judges'].map(person => person.id).includes(userID)
// 		) {
// 			myScheduleItem = ScheduleItem;
// 			return true;
// 		}
// 	});
// 	return myScheduleItem;
// }

export default function Dashboard() {
	const judgingLength = parseInt(JUDGING_LENGTH || '0');
	const { data: scheduleData, error: scheduleError } = useSWR('/api/schedule', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as ScheduleDisplay[];
	});

	const [nextIndex, setNextIndex] = useState(-1);
	const [currentScheduleItem, setCurrentScheduleItem] = useState<ScheduleDisplay | undefined>(undefined);
	const [nextScheduleItem, setNextScheduleItem] = useState<ScheduleDisplay | undefined>(undefined);
	// Initialize state if data was just received
	useEffect(() => {
		if (nextIndex === -1 && scheduleData) {
			const now = Date.now();
			let index = scheduleData.findIndex(el => now < new Date(el.time).getTime());
			if (index === -1) index = scheduleData.length;
			let currentlyGoingTime = new Date(scheduleData[index - 1]?.time).getTime() + judgingLength;
			setNextScheduleItem(scheduleData[index]);
			setCurrentScheduleItem(
				now < currentlyGoingTime
					? scheduleData[index - 1]
					: undefined
			);
			setNextIndex(index);
		}
	}, [scheduleData, nextIndex, judgingLength]);

	// Loop to manage current schedule state
	useEffect(() => {
		const interval = setInterval(() => {
			const now = Date.now();
			if (scheduleData && nextIndex > -1) {
				// Data has been received and state is initialized
				let time2 = new Date(scheduleData[scheduleData.length - 1]?.time).getTime() + judgingLength;
				if (now <= time2) {
					// Not yet done judging
					let time3 = new Date(currentScheduleItem?.time || 0).getTime() + judgingLength;

					if (nextIndex < scheduleData.length && now >= new Date(nextScheduleItem?.time || 0).getTime()) {
						// Next event should be current
						setNextScheduleItem(scheduleData[nextIndex + 1]);
						setCurrentScheduleItem(scheduleData[nextIndex]);
						setNextIndex(nextIndex + 1);
					} else if (now > time3) {
						// Next event has not yet arrived but current event is over
						setCurrentScheduleItem(undefined);
					}
				} else {
					// Done judging
					setCurrentScheduleItem(undefined);
				}
			}
		}, 1000);
		return () => clearInterval(interval);
	});

	const [session, loading] = useSession();
	if (!loading && !session) return signIn();
	let pageContent;
	if (scheduleError) {
		console.error('Error:', scheduleError);
		pageContent = <ErrorMessage status={scheduleError.status} />;
	} else if (!scheduleData || loading) {
		pageContent = <Skeleton />;
	} else {
		pageContent = (
			<>
				{(session?.userType === 'JUDGE' || session?.userType === 'HACKER') && (
					<Cards current={currentScheduleItem} next={nextScheduleItem} />
				)}
				{session?.userType === 'JUDGE' && (
					<JudgeSchedule data={scheduleData} cutoffIndex={currentScheduleItem ? nextIndex - 1 : nextIndex} />
				)}
				{session?.userType === 'ORGANIZER' && <OrganizerSchedule data={scheduleData} />}
			</>
		);
	}

	// let cards;
	// if (currentScheduleItem === undefined || nextScheduleItem === undefined) {
	// 	cards = <Skeleton />;
	// } else if (currentScheduleItem.time === -1 && nextScheduleItem.time === -1) {
	// 	cards = <AllDone />;
	// } else {
	// 	cards = (
	// 		<Row gutter={16}>
	// 			{currentScheduleItem.time > -1 && (
	// 				<Col className="gutter-row" flex={1}>
	// 					<Current {...currentScheduleItem} />
	// 				</Col>
	// 			)}
	// 			{nextScheduleItem.time > -1 && (
	// 				<Col className="gutter-row" flex={1}>
	// 					<UpNext {...nextScheduleItem} />
	// 				</Col>
	// 			)}
	// 		</Row>
	// 	);
	// }
	// pageContent = (
	// 	<>
	// 		{cards}
	// 		<Divider>Schedule</Divider>
	// 		<Schedule
	// 			data={scheduleData}
	// 			onScheduleAdvance={() => {
	// 				setNextScheduleItem(getScheduleItem('next', scheduleData));
	// 				setCurrentScheduleItem(getScheduleItem('current', scheduleData));
	// 			}}
	// 		/>
	// 	</>
	// );

	return (
		<Outline selectedKey="dashboard">
			<h1>Dashboard</h1>
			<p>Signed in as {session?.user?.email}</p>
			{pageContent}
		</Outline>
	);
}

export async function getStaticProps() {
	return {
		props: { title: 'Dashboard' },
	};
}
