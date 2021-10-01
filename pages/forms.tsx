import { Divider, Space, Skeleton, Alert, notification } from 'antd';
import React from 'react';
import JudgingForm from '../components/judgingForm';
import Outline from '../components/outline';
import TeamSelect from '../components/teamSelect';
import useSWR from 'swr';
import { JudgingFormData } from '../pages/api/judging-form';

function handleSubmitSuccess() {
	notification['success']({
		message: 'Successfully submitted!',
		placement: 'bottomRight',
	});
}

function handleSubmitFailure() {
	notification['error']({
		message: 'Oops, something went wrong!',
		description: 'Please try again or contact an organizer if the problem persists.',
		placement: 'bottomRight',
	});
}

async function onSubmit(formData: JudgingFormData) {
	console.log(formData);
	const res = await fetch('/api/judging-form', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	});

	if (res.ok) handleSubmitSuccess();
	else handleSubmitFailure();
}

export default function Forms() {
	// Get data for form component
	const { data: formData, error: formError } = useSWR('/api/judging-form', async url => {
		const res = await fetch(url, { method: 'GET' });
		return (await res.json()) as JudgingFormData;
	});

	if (formError)
		return (
			<Alert
				message="An unknown error has occured in when loading the judging form. Please try again or reach out to an organizer."
				type="error"
			/>
		);
	// Loading screen
	if (!formData) return <Skeleton />;

	return (
		<Outline>
			<h1>Judging Form</h1>
			<Space direction="vertical" style={{ width: '100%' }}>
				<TeamSelect handleChange={() => {}} />
				<Divider />
				<JudgingForm formData={formData} onSubmit={onSubmit} />
			</Space>
		</Outline>
	);
}
