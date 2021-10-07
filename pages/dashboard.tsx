import { Alert, Button, Col, Divider, Row, Skeleton, Timeline } from 'antd';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { AllDone, Current, UpNext } from '../components/scheduleItem';
import Outline from '../components/outline';
import Schedule, { JudgeSchedule } from '../components/schedule';
import Cards from '../components/cards';
import { ScheduleData } from './api/schedule';
import { ResponseError } from '../types/types';
import { signIn, useSession } from 'next-auth/client';
import schedule from '../models/schedule';
import Link from 'next/link';
import ErrorMessage from '../components/errorMessage';

// TODO: stub
const userID = '0';
const userType = 'JUDGE';

export const JUDGING_LENGTH = 3000; //600000;

// TODO: this is horribly inefficient right now, as it checks through the whole dataset on every update
// request. Rewrite this to use the restructured dataset in schedule.tsx.
function getScheduleItem(type: 'current' | 'next', schedule: ScheduleData[]): ScheduleData {
	// TODO: currently only configured for judge. Should do for user.
	const now = new Date().getTime();
	let myScheduleItem = {
		startTime: -1,
		projectName: '',
		members: [{ id: '', name: '' }],
		judges: [{ id: '', name: '' }],
		devpostURL: '',
		zoomURL: '',
	};
	schedule.some(ScheduleItem => {
		// TODO: judges is hard coded.
		if (
			((type === 'next' && ScheduleItem.startTime > now) ||
				(type === 'current' && ScheduleItem.startTime + judgingLength > now && ScheduleItem.startTime < now)) &&
			ScheduleItem['judges'].map(person => person.id).includes(userID)
		) {
			myScheduleItem = ScheduleItem;
			return true;
		}
	});
	return myScheduleItem;
}

export default function Dashboard() {
	// TODO: trap state page
	const { data: scheduleData, error: scheduleError } = useSWR('/api/schedule', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as ScheduleData[];
	});

	const [nextIndex, setNextIndex] = useState(-1);
	const [currentScheduleItem, setCurrentScheduleItem] = useState<ScheduleData | undefined>(undefined);
	const [nextScheduleItem, setNextScheduleItem] = useState<ScheduleData | undefined>(undefined);
	// Initialize state if data was just received
	useEffect(() => {
		if (nextIndex === -1 && scheduleData) {
			const now = Date.now();
			let index = scheduleData.findIndex(el => now < el.startTime);
			if (index === -1) index = scheduleData.length;
			setNextScheduleItem(scheduleData[index]);
			setCurrentScheduleItem(
				now < scheduleData[index - 1]?.startTime + JUDGING_LENGTH ? scheduleData[index - 1] : undefined
			);
			setNextIndex(index);
		}
	}, [scheduleData, nextIndex]);

	// Loop to manage current schedule state
	useEffect(() => {
		const interval = setInterval(() => {
			const now = Date.now();
			if (scheduleData && nextIndex > -1) {
				// Data has been received and state is initialized
				if (now <= scheduleData[scheduleData.length - 1].startTime + JUDGING_LENGTH) {
					// Not yet done judging
					if (nextIndex < scheduleData.length && now > (nextScheduleItem?.startTime || 0)) {
						// Next event should be current
						setNextScheduleItem(scheduleData[nextIndex + 1]);
						setCurrentScheduleItem(scheduleData[nextIndex]);
						setNextIndex(nextIndex + 1);
					} else if (now > (currentScheduleItem?.startTime || 0) + JUDGING_LENGTH) {
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
			</>
		);
	}

	// let cards;
	// if (currentScheduleItem === undefined || nextScheduleItem === undefined) {
	// 	cards = <Skeleton />;
	// } else if (currentScheduleItem.startTime === -1 && nextScheduleItem.startTime === -1) {
	// 	cards = <AllDone />;
	// } else {
	// 	cards = (
	// 		<Row gutter={16}>
	// 			{currentScheduleItem.startTime > -1 && (
	// 				<Col className="gutter-row" flex={1}>
	// 					<Current {...currentScheduleItem} />
	// 				</Col>
	// 			)}
	// 			{nextScheduleItem.startTime > -1 && (
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
