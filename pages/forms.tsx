import { Divider, Space } from 'antd';
import React from 'react';
import JudgingForm from '../components/judgingForm';
import Outline from '../components/outline';
import TeamSelect from '../components/teamSelect';

export default function Forms() {
	return (
		<Outline>
			<h1>Judging Form</h1>
			<Space direction="vertical" style={{ width: "100%" }}>
				<TeamSelect handleChange={() => {}}/>
				<Divider />
				<JudgingForm />
			</Space>
		</Outline>
	);
}
