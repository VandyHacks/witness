import React from 'react';
import styles from '../../../styles/hacker/hacking-start.module.css';

const Header = () => {
	return (
		<>
			<div className={styles.HeaderBox}>
				<div className={styles.HeaderTopBox}>
					<span className={styles.Logo}></span>
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
