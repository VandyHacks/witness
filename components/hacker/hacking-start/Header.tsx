import React, { useEffect, useState } from 'react';
import styles from '../../../styles/hacker/hacking-start.module.css';
import Image from 'next/image';
import VHLogo from '../../../public/vh-logo.png';
import { HackathonSettingsData, UserData } from '../../../types/database';

// Contains event name and image
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
const duringHackathon: EventParams = {
	eventName: 'Hacking Now',
	eventImage: '/during-hackathon.svg',
};
const judging: EventParams = {
	eventName: 'Judging',
	eventImage: '/judging.svg',
};
const hackingEnded: EventParams = {
	eventName: 'Hacking Ended',
	eventImage: '/hacking-ended.svg',
};

const Header = ({
	user,
	signOut,
	setting,
}: {
	user: UserData;
	signOut: () => void;
	setting: HackathonSettingsData;
}) => {
	const [curEvent, setCurEvent] = useState<EventParams>(hackingBeginSoon);
	const [timeLeft, setTimeLeft] = useState<string>('');

	useEffect(() => {
		// Dates from setting
		const hackingStartDate = new Date(Date.parse(setting.HACKATHON_START));
		const hackingCountDownDate = new Date(hackingStartDate);
		hackingCountDownDate.setDate(hackingStartDate.getDate() - 1);
		const judgeStartDate = new Date(Date.parse(setting.JUDGING_START));
		const judgeEndDate = new Date(Date.parse(setting.JUDGING_END));
		const curDate = new Date();

		// Set current event based on date
		if (curDate < hackingStartDate) {
			setCurEvent(hackingBeginSoon);
		} else if (curDate < hackingStartDate && curDate > hackingCountDownDate) {
			setCurEvent(hackingCountDown);
		} else if (curDate < judgeStartDate && curDate > hackingStartDate) {
			setCurEvent(duringHackathon);
		} else if (curDate < judgeEndDate && curDate > judgeStartDate) {
			setCurEvent(judging);
		} else {
			setCurEvent(hackingEnded);
		}
	}, [setting]);

	useEffect(() => {
		if (curEvent === hackingCountDown) {
			const interval = setInterval(() => {
				const curDate = new Date();
				const hackingStartDate = new Date(Date.parse(setting.HACKATHON_START));
				const timeLeft = Math.floor((hackingStartDate.getTime() - curDate.getTime()) / 1000);
				const hours = Math.floor(timeLeft / 3600);
				const minutes = Math.floor((timeLeft % 3600) / 60);
				const seconds = timeLeft % 60;
				const timeString = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${
					seconds < 10 ? '0' : ''
				}${seconds}`;
				setTimeLeft(timeString);
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [curEvent, setting.HACKATHON_START]);

	return (
		<>
			<div className={styles.HeaderBox}>
				<div className={styles.HeaderTopBox}>
					<Image alt="" width={150} height={150} src={VHLogo} />
					<span className={styles.SignOut}>
						<span className={styles.Email}>{user.email}</span>
						<button className={styles.SignOutButton} onClick={() => signOut()}>
							Sign Out
						</button>
					</span>
				</div>
			</div>
			<div className={styles.HeaderMiddleBox}>
				<span className={styles.UserName}>
					<div className={styles.Greeting}>Hello,</div>
					<div className={styles.Greeting}>{user.name}</div>
					<div className={styles.NFCPoint}>
						You currently have {user.nfcPoints} points. Participate in events to start earning more!
					</div>
				</span>
				<span className={styles.CurEvent}>
					<div className={styles.CurEventText}>Current Event</div>
					<div className={styles.IconContainer}>
						<Image src={curEvent.eventImage} width={300} height={300} alt={curEvent.eventName} />
						{curEvent === hackingCountDown && <div className={styles.Timer}>{timeLeft}</div>}
					</div>
					<div className={styles.CurEventText}>{curEvent.eventName}</div>
				</span>
			</div>
		</>
	);
};

export default Header;
