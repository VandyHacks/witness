import React, { useEffect, useState } from 'react';
import styles from '../../../styles/hacker/hacking-start.module.css';
import Image from 'next/image';
import VHLogo from '../../../public/vh-logo.png';
import { HackathonSettingsData, UserData } from '../../../types/database';
import HackingBeginSoon from '../../../public/hacking-begin-soon.svg';
import useSWR from 'swr';

const Header = ({
	user,
	signOut,
	setting,
}: {
	user: UserData;
	signOut: () => void;
	setting: HackathonSettingsData;
}) => {
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
		eventName: 'Hacking Begins Soon',
		eventImage: '/hacking-countdown.svg',
	};
	const judging: EventParams = {
		eventName: 'Hacking Begins Soon',
		eventImage: '/judging.svg',
	};
	const hackingEnded: EventParams = {
		eventName: 'Hacking Begins Soon',
		eventImage: '/hacking-ended.svg',
	};
	const [curEvent, setCurEvent] = useState<EventParams>(hackingBeginSoon);

	const hackingStartDate = new Date(Date.parse(setting.HACKATHON_START));
	const hackingCountDownDate = new Date(hackingStartDate);
	hackingCountDownDate.setDate(hackingStartDate.getDate() - 1);
	const judgeStartDate = new Date(Date.parse(setting.JUDGING_START));
	const judgeEndDate = new Date(Date.parse(setting.JUDGING_END));
	const hackingEndDate = new Date(Date.parse(setting.HACKATHON_END));
	const curDate = new Date();

	console.log('Cur ', curDate);
	console.log('Start ', hackingStartDate);
	console.log('Countdown ', hackingCountDownDate);
	console.log('Judge start ', judgeStartDate);
	console.log('Judge end ', judgeEndDate);
	console.log('End', hackingEndDate);

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
				<div className={styles.HeaderMiddleBox}>
					<span className={styles.UserName}>
						<div className={styles.Greeting}>Hello,</div>
						<div className={styles.Greeting}>{user.name}</div>
						<div className={styles.NFCPoint}>Your currently have {user.nfcPoints} points</div>
					</span>
					<span className={styles.CurEvent}>
						<div className={styles.CurEventText}>Current Event</div>
						<Image src={curEvent.eventImage} width={300} height={300} alt="Hacking Begin Soon" />
						<div className={styles.CurEventText}>{curEvent.eventName}</div>
					</span>
				</div>
			</div>
		</>
	);
};

export default Header;
