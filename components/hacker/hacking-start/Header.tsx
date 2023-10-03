import React from 'react';
import styles from '../../../styles/hacker/hacking-start.module.css';
import Image from 'next/image';
import VHLogo from '../../../public/vh-logo.png';
import { UserData } from '../../../types/database';
import HackingBeginSoon from '../../../public/hacking-begin-soon.svg';

const Header = ({ user, signOut }: { user: UserData; signOut: () => void }) => {
	return (
		<>
			<div className={styles.HeaderBox}>
				<div className={styles.HeaderTopBox}>
					<Image alt="" width={150} height={150} src={VHLogo} className={styles.Logo} />
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
						<div className={styles.NFCPoint}>{user.nfcPoints + ' points to spend'}</div>
					</span>
					<span className={styles.CurEvent}>
						<div className={styles.CurEventText}>Current Event</div>
						<Image
							className={styles.CurEventImage}
							src={HackingBeginSoon}
							width={300}
							height={300}
							alt=""
						/>
						<div className={styles.CurEventText}>Hacking Begins Soon</div>
					</span>
				</div>
			</div>
		</>
	);
};

export default Header;
