import { Button, DatePicker, Select, Space } from 'antd';
import dayjs from 'dayjs';
import React, { useContext, useEffect, useState } from 'react';
import { handleSubmitFailure, handleSubmitSuccess } from '../../../lib/helpers';
import { getBaseColor, ThemeContext } from '../../../theme/themeProvider';
import { HackathonSettingsData } from '../../../types/database';

const HackathonSettings = () => {
	const { baseTheme } = useContext(ThemeContext);
	const [hackathonSetting, setHackathonSetting] = useState<HackathonSettingsData | undefined>(undefined);
	const [onCallDev, setOnCallDev] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [statusMessage, setStatusMessage] = useState<string>('');

	// hehe sorry
	const devInputValues = [
		{
			value: 'jacoblurie29',
			label: 'Jacob Lurie',
		},
		{
			value: 'zineanteoh',
			label: 'Zi Teoh',
		},
	];

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
				handleSubmitSuccess('Successfully saved to database!');
			} else {
				setStatusMessage('Failed to save to database!');
				handleSubmitFailure('Failed to save to database!');
			}
		}
	};

	const handleHackathonChange = (_: any, dateStrings: [string, string]) => {
		const newHackathonStart = dayjs(dateStrings[0], 'MM-DD-YYYY hh:mm A').format('MM/DD/YYYY hh:mm A');
		const newHackathonEnd = dayjs(dateStrings[1], { utc: true }).format('MM/DD/YYYY hh:mm A');
		console.log('Changing Hackathon: ', newHackathonStart);
		console.log('Changing Hackathon: ', newHackathonEnd);
		setHackathonSetting(prev => {
			if (prev)
				return {
					...prev,
					HACKATHON_START: newHackathonStart,
					HACKATHON_END: newHackathonEnd,
				};
			return undefined;
		});
		setStatusMessage('Changes not saved yet.');
	};

	const handleJudgingChange = (_: any, dateStrings: [string, string]) => {
		const newJudgingStart = dayjs(dateStrings[0], { utc: true }).format('MM/DD/YYYY hh:mm A');
		const newJudgingEnd = dayjs(dateStrings[1], { utc: true }).format('MM/DD/YYYY hh:mm A');
		setHackathonSetting(prev => {
			if (prev)
				return {
					...prev,
					JUDGING_START: newJudgingStart,
					JUDGING_END: newJudgingEnd,
				};
			return undefined;
		});
		setStatusMessage('Changes not saved yet.');
	};

	const handleOnCallDevChange = (value: string) => {
		setOnCallDev(value);
		setHackathonSetting(prev => {
			if (prev) return { ...prev, ON_CALL_DEV: value };
			return undefined;
		});
		setStatusMessage('Changes not saved yet.');
	};

	if (loading) return <div>Loading...</div>;

	console.log('Hackathon Settings: ', hackathonSetting);

	return (
		<div style={{ color: getBaseColor(baseTheme) }}>
			<div>Hackathon Start & End</div>
			<DatePicker.RangePicker
				format="MM/DD/YYYY hh:mm A"
				showTime={{ format: 'hh:mm A' }}
				onChange={handleHackathonChange}
				defaultValue={[dayjs(hackathonSetting?.HACKATHON_START), dayjs(hackathonSetting?.HACKATHON_END)]}
			/>

			<br />

			<div>Judging Start & End</div>
			<DatePicker.RangePicker
				format="MM/DD/YYYY hh:mm A"
				showTime={{ format: 'hh:mm A' }}
				onChange={handleJudgingChange}
				defaultValue={[dayjs(hackathonSetting?.JUDGING_START), dayjs(hackathonSetting?.JUDGING_END)]}
			/>

			<br />
			<br />

			<Select
				options={devInputValues}
				defaultValue={hackathonSetting?.ON_CALL_DEV || 'jacoblurie29'}
				onChange={handleOnCallDevChange}
			/>

			<br />
			<br />

			<Button onClick={handleSave}>Save dates to database</Button>

			{statusMessage && <div>{statusMessage}</div>}
		</div>
	);
};

export default HackathonSettings;
