import { Form } from 'antd';
import React from 'react';

import styles from '../../styles/Form.module.css';

const RegistrationLogo = () => {
	return (
		<>
			<Form.Item className={styles.TitleLogo}> </Form.Item>
			<div className={styles.TitleContainer}>
				<div className={styles.Title}>VandyHacks XI Registration</div>
			</div>
		</>
	);
};

export default RegistrationLogo;
