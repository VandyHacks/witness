import React from 'react';
import Outline from '../components/outline';

export default function FirstPost() {
	return (
		<Outline>
			<h1>Judging form</h1>
			<p>Dropdown at top specifying which team this is for. Judges' forms are associated with them by default.</p>
			<p>Should be able to save / submit. Either way it can be retroactively edited.</p>
		</Outline>
	);
}
