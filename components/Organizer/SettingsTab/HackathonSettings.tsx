import React, { useContext, useEffect, useState } from 'react';
import { getBaseColor, ThemeContext } from '../../../theme/themeProvider';
import { HackathonSettingsData } from '../../../types/database';

/**
 * Parse a date from Date object to "yyyy-mm-ddThh:mm" format
 * so that it can be used in <input type="datetime-local" />
 * @param date  Date object to parse
 * @returns     String in "yyyy-mm-ddThh:mm" format
 */
const parseDateToLocaleString = (date: Date | undefined) => {
	if (!date) return '';

	const dateObj = new Date(date);

	const year = dateObj.getFullYear();
	const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
	const day = dateObj.getDate().toString().padStart(2, '0');
	const hour = dateObj.getHours().toString().padStart(2, '0');
	const minute = dateObj.getMinutes().toString().padStart(2, '0');

	return `${year}-${month}-${day}T${hour}:${minute}`;
};

const HackathonSettings = () => {
	const { baseTheme } = useContext(ThemeContext);
	const [hackathonSetting, setHackathonSetting] = useState<HackathonSettingsData | undefined>(undefined);
	const [loading, setLoading] = useState<boolean>(false);
	const [statusMessage, setStatusMessage] = useState<string>('');

	// fetch hackathon settings on load at /api/hackathon-settings
	useEffect(() => {
		const fetchHackathonSettings = async () => {
			const res = await fetch('/api/hackathon-settings');
			if (res.ok) {
				const settings = await res.json();
				setHackathonSetting(settings as HackathonSettingsData);
				setLoading(false);
			}
		};
		setLoading(true);
		fetchHackathonSettings();
	}, []);

	// handle save button
	const handleSave = async () => {
		if (
			window.confirm(
				'IMPORTANT: \nAre you sure you wish to save these dates?\nMake sure you know what you are doing!'
			)
		) {
			const res = await fetch('/api/hackathon-settings', {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(hackathonSetting),
			});
			if (res.ok) {
				const settings = await res.json();
				setHackathonSetting(settings as HackathonSettingsData);
				setStatusMessage('Successfully saved to database!');
			}
		}
	};

	const handleHackathonStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newDate = new Date(e.target.value);
		setHackathonSetting(prev => {
			if (prev) return { ...prev, HACKATHON_START: newDate };
			return undefined;
		});
		setStatusMessage('Changes not saved yet.');
	};

	const handleHackathonEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newDate = new Date(e.target.value);
		setHackathonSetting(prev => {
			if (prev) return { ...prev, HACKATHON_END: newDate };
			return undefined;
		});
		setStatusMessage('Changes not saved yet.');
	};

	const handleJudgingStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newDate = new Date(e.target.value);
		setHackathonSetting(prev => {
			if (prev) return { ...prev, JUDGING_START: newDate };
			return undefined;
		});
		setStatusMessage('Changes not saved yet.');
	};

	const handleJudgingEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newDate = new Date(e.target.value);
		setHackathonSetting(prev => {
			if (prev) return { ...prev, JUDGING_END: newDate };
			return undefined;
		});
		setStatusMessage('Changes not saved yet.');
	};

	if (loading) return <div>Loading...</div>;

	return (
		<div style={{ color: getBaseColor(baseTheme) }}>
			<div>Hackathon Start & End</div>
			<div>
				<input
					type="datetime-local"
					defaultValue={parseDateToLocaleString(hackathonSetting?.HACKATHON_START)}
					onChange={handleHackathonStartChange}
				/>
				<span> To </span>
				<input
					type="datetime-local"
					defaultValue={parseDateToLocaleString(hackathonSetting?.HACKATHON_END)}
					onChange={handleHackathonEndChange}
				/>
			</div>

			<br />

			<div>Judging Start & End</div>
			<div>
				<input
					type="datetime-local"
					defaultValue={parseDateToLocaleString(hackathonSetting?.JUDGING_START)}
					onChange={handleJudgingStartChange}
				/>
				<span> To </span>
				<input
					type="datetime-local"
					defaultValue={parseDateToLocaleString(hackathonSetting?.JUDGING_END)}
					onChange={handleJudgingEndChange}
				/>
			</div>

			<br />

			<button onClick={handleSave}>Save dates to database</button>
			{statusMessage && <div>{statusMessage}</div>}
		</div>
	);
};

export default HackathonSettings;
