import React from 'react';
import styles from '../../../styles/hacker/hacking-start.module.css';
import Image from 'next/image';
import VHLogo from '../../../public/vh-logo.png';
import { UserData } from '../../../types/database';

const Header = ({ user, signOut }: { user: UserData | any; signOut: () => void }) => {
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
					<span className={styles.UserName}></span>
					<span className={styles.CurEvent}></span>
				</div>
			</div>
		</>
	);
};

export default Header;
