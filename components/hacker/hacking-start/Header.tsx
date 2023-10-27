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
	}, [setting]);

	useEffect(() => {
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
		}
	}, [curEvent, setting.HACKATHON_START, setting.HACKATHON_END]);

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
