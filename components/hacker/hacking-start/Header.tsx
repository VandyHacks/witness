import React from 'react';
import styles from '../../../styles/hacker/hacking-start.module.css';
import Image from 'next/image';
import VHLogo from '../../../public/vh-logo.png';

const Header = () => {
	return (
		<>
			<div className={styles.HeaderBox}>
				<div className={styles.HeaderTopBox}>
					<Image alt="" width={175} height={175} src={VHLogo} className={styles.Logo}></Image>
					<span className={styles.SignOut}></span>
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
