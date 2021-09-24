import React from 'react';
import JudgingForm from '../components/judgingForm';
import Outline from '../components/outline';
import TeamSelect from '../components/teamSelect';

export default function FirstPost() {
	return (
		<Outline>
			<TeamSelect />
			<JudgingForm />
			<h1>Judging form</h1>
			<p>Dropdown at top specifying which team this is for. Judging forms are associated with them by default.</p>
			<p>Should be able to save / submit. Either way it can be retroactively edited.</p>
		</Outline>
	);
}
