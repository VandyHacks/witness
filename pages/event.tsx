import React, { useEffect, useState } from 'react';
import { Button, Layout } from 'antd';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Leaderboard from '../components/hacker/Leaderboard';
import { HackathonSettingsData, UserData } from '../types/database';
import Image from 'next/image';
import useSWR from 'swr';
import styles from '../styles/Event.module.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/router';

const DEV_DEPLOY =
	process.env.NODE_ENV === 'development' || ['preview', 'development'].includes(process.env.NEXT_PUBLIC_VERCEL_ENV!); // frontend env variable

interface EventParams {
	eventName: string;
	eventImage: string;
	countDown?: Date;
}

const hackingBeginSoon: EventParams = {
	eventName: 'Hacking Begins Soon',
	eventImage: '/hacking-begin-soon.svg',
};
const hackingCountDown: EventParams = {
	eventName: 'Hacking Begins',
	eventImage: '/hacking-countdown.svg',
};
const judging: EventParams = {
	eventName: 'Judging',
	eventImage: '/judging.svg',
};
const hackingEnded: EventParams = {
	eventName: 'Hacking Ended',
	eventImage: '/hacking-ended.svg',
};

const EventScreen = () => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [curEvent, setCurEvent] = useState<EventParams>(hackingBeginSoon);
	const [timeLeft, setTimeLeft] = useState<string>('');
	const [hackathonStarted, setHackathonStarted] = useState(false);

	const { data: user } = useSWR(
		'/api/user-data',
		async url => {
			const res = await fetch(url, { method: 'GET' });
			return (await res.json()) as UserData;
		},
		{ revalidateOnFocus: false, revalidateOnMount: true }
	);

	const { data: setting } = useSWR(
		'/api/hackathon-settings',
		async url => {
			const res = await fetch(url, { method: 'GET' });

			const hackathongSetting = (await res.json()) as HackathonSettingsData;
			const hackathonStartDate = new Date(Date.parse(hackathongSetting.HACKATHON_START));
			const hackathonEndDate = new Date(Date.parse(hackathongSetting.HACKATHON_END));
			const curDate = new Date();

			// DEV_DEPLOY is true if we are in development or preview mode
			if (DEV_DEPLOY) {
				setHackathonStarted(true);
			} else {
				setHackathonStarted(curDate >= hackathonStartDate && curDate <= hackathonEndDate);
			}

			return hackathongSetting;
		},
		{ revalidateOnFocus: false, revalidateOnMount: true }
	);

	const redirectToHome = () => {
		router.push('/');
	};

	useEffect(() => {
		if (setting) {
			// Dates from setting
			const hackingStartDate = new Date(Date.parse(setting.HACKATHON_START));
			const hackingEndDate = new Date(Date.parse(setting.HACKATHON_END));
			const judgingDateEnd = new Date(Date.parse(setting.JUDGING_END));
			const curDate = new Date();

			// Check if hacking has started
			if (curDate < hackingStartDate) {
				setCurEvent(hackingBeginSoon);
			} else if (curDate < hackingEndDate) {
				setCurEvent(hackingCountDown);
			} else if (curDate <= judgingDateEnd) {
				setCurEvent(judging);
			} else {
				setCurEvent(hackingEnded);
			}
		}
	}, [setting]);

	useEffect(() => {
		if (setting) {
			if (curEvent === hackingBeginSoon) {
				const interval = setInterval(() => {
					// check every second if hacking should start
					const hackingStartDate = new Date(Date.parse(setting.HACKATHON_START));

					const curDate = new Date();

					if (curDate >= hackingStartDate) {
						setCurEvent(hackingCountDown);
						return () => clearInterval(interval);
					}
				}, 1000);

				return () => clearInterval(interval);
			} else if (curEvent === hackingCountDown) {
				const interval = setInterval(() => {
					const hackingEndDate = new Date(Date.parse(setting.HACKATHON_END));
					const curDate = new Date();

					// convert time to 00:00:00 format
					const timeLeft = Math.floor((hackingEndDate.getTime() - curDate.getTime()) / 1000);

					if (timeLeft < 0) {
						setTimeLeft('00:00:00');
						setCurEvent(judging);
						return;
					}

					const hours = Math.floor(timeLeft / 3600);
					const minutes = Math.floor((timeLeft % 3600) / 60);
					const seconds = timeLeft % 60;
					const timeString = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${
						seconds < 10 ? '0' : ''
					}${seconds}`;

					// set time left
					setTimeLeft(timeString);
				}, 1000);
				return () => clearInterval(interval);
			} else if (curEvent === judging) {
				const interval = setInterval(() => {
					const judgingDateEnd = new Date(Date.parse(setting.JUDGING_END));
					const curDate = new Date();

					if (curDate > judgingDateEnd) {
						setCurEvent(hackingEnded);
						return () => clearInterval(interval);
					}
				}, 1000);
			}
		}
	}, [curEvent, setting]);

	return (
		<>
			<Head>
				<title>Report a bug!</title>
				<meta property="og:title" content="VandyHacks X - Report a bug" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://apply.vandyhacks.org" />
				<meta property="og:image" content="/vh.png" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@vandyhacks" />
				<meta name="twitter:creator" content="@vandyhacks" />
				<meta name="author" content="VandyHacks" />
				<meta name="description" content="Event display for VHX!👨🏻‍💻" />
				<meta property="og:description" content="Report a bug for the VandyHacks application!👨🏻‍💻" />
			</Head>

			<Layout
				style={{
					width: '100vw',
					backgroundImage: 'url(background-1.png)',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: `center`,
					backgroundAttachment: 'fixed',
					backgroundSize: 'cover',
					display: 'flex',
					justifyContent: 'flex-start',
					paddingTop: '5rem',
					alignItems: 'center',
					overflow: 'hidden',
					height: '100vh',
				}}>
				{!session ? null : session.userType === 'ORGANIZER' ? (
					<div className={styles.eventContainer}>
						<div>
							<Image src={'/vh-logo.png'} width={300} height={300} alt={'VandyHacks Logo'} />
							<span className={styles.CurEvent}>
								<div className={styles.IconContainer}>
									<Image
										src={curEvent.eventImage}
										width={300}
										height={300}
										alt={curEvent.eventName}
									/>
									{curEvent === hackingCountDown && <div className={styles.Timer}>{timeLeft}</div>}
								</div>
								<div className={styles.CurEventText}>
									<span className={styles.CurEventThinText}>Current Event: </span>
									{curEvent.eventName}
								</div>
							</span>
						</div>
						<div className={styles.leaderboard}>
							<Leaderboard />
						</div>
					</div>
				) : (
					redirectToHome()
				)}
				<Button className={styles.goHomeButton}>
					<Link href="/">
						<a>
							<ArrowLeftOutlined />
							&nbsp;&nbsp;Return Home
						</a>
					</Link>
				</Button>
			</Layout>
		</>
	);
};

export default EventScreen;
