import React, { useEffect, useState } from 'react';
import styles from '../../../styles/hacker/hacking-start.module.css';
import Image from 'next/image';
import VHLogo from '../../../public/vh-logo.png';
import { HackathonSettingsData, UserData } from '../../../types/database';
import HackingBeginSoon from '../../../public/hacking-begin-soon.svg';
import Judging from '../../../public/judging.svg';
import HackingEnded from '../../../public/hacking-ended.svg';
import DuringHackathon from '../../../public/during-hackathon.svg';

// Contains event name and image
interface EventParams {
	eventName: string;
	eventImage: string;
	countDown?: Date;
}

const hackingBeginSoon: EventParams = {
	eventName: 'Hacking Begins Soon',
	eventImage: HackingBeginSoon,
};
// const hackingCountDown: EventParams = {
// 	eventName: 'Hacking Begins',
// 	eventImage: '/hacking-countdown.svg',
// };
const judging: EventParams = {
	eventName: 'Judging',
	eventImage: Judging,
};
const hackingEnded: EventParams = {
	eventName: 'Hacking Ended',
	eventImage: HackingEnded,
};
const duringHackathon: EventParams = {
	eventName: 'Hacking Now',
	eventImage: DuringHackathon,
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

	useEffect(() => {
		// All events

		// Dates from setting
		const hackingStartDate = new Date(Date.parse(setting.HACKATHON_START));
		const hackingCountDownDate = new Date(hackingStartDate);
		hackingCountDownDate.setDate(hackingStartDate.getDate() - 1);
		const judgeStartDate = new Date(Date.parse(setting.JUDGING_START));
		const judgeEndDate = new Date(Date.parse(setting.JUDGING_END));
		const hackingEndDate = new Date(Date.parse(setting.HACKATHON_END));
		const curDate = new Date();

		// console.log('Cur ', curDate);
		// console.log('Start ', hackingStartDate);
		// console.log('Countdown ', hackingCountDownDate);
		// console.log('Judge start ', judgeStartDate);
		// console.log('Judge end ', judgeEndDate);
		// console.log('End', hackingEndDate);

		// Set current event based on date
		if (curDate < hackingStartDate) {
			setCurEvent(hackingBeginSoon);
			// } else if (curDate < hackingStartDate && curDate > hackingCountDownDate) {
			// 	setCurEvent(hackingCountDown);
		} else if (curDate < judgeStartDate && curDate > hackingStartDate) {
			setCurEvent(duringHackathon);
		} else if (curDate < judgeEndDate && curDate > judgeStartDate) {
			setCurEvent(judging);
		} else {
			setCurEvent(hackingEnded);
		}
	}, [setting]);

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
					<Image src={curEvent.eventImage} width={300} height={300} alt={curEvent.eventName} />
					{/* {curEvent.eventImage} */}
					<div className={styles.CurEventText}>{curEvent.eventName}</div>
				</span>
			</div>
		</>
	);
};

export default Header;
