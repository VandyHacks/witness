import { Divider, Space, Skeleton, Alert, notification, Empty } from 'antd';
import React, { useEffect, useState } from 'react';
import JudgingForm from '../components/judgingForm';
import Outline from '../components/outline';
import TeamSelect from '../components/teamSelect';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { JudgingFormData } from './api/judging-form';
import { TeamsData } from './api/team-select';

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
	// Use query string to get team ID
	const router = useRouter();
	let { id: idFromQueryString } = router.query;
	const [teamID, setTeamID] = useState(idFromQueryString as string | undefined);
	useEffect(() => {
		setTeamID(idFromQueryString as string | undefined);
	}, [idFromQueryString]);
	// Get data for teams dropdown
	const { data: teamsData, error: teamsError } = useSWR('/api/team-select', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) throw new Error('Failed to get list of teams.');
		return (await res.json()) as TeamsData;
	});
	// Get data for form component, formData will be falsy if teamID is not yet set.
	const { data: formData, error: formError } = useSWR(
		() => (teamID ? ['/api/judging-form', teamID] : null),
		async (url, id) => {
			const res = await fetch(`${url}?id=${id}`, { method: 'GET' });
			if (!res.ok) throw new Error('Failed to get team information.');
			return (await res.json()) as JudgingFormData;
		}
	);

	let pageContent;
	if (teamsError) {
		// if error fetching teams, everything dies
		pageContent = (
			<Alert
				message="An unknown error has occured. Please try again or reach out to an organizer."
				type="error"
			/>
		);
	} else if (!teamsData) {
		// otherwise, wait for teamsData to load
		pageContent = <Skeleton />;
	} else {
		// teamsData loaded, moving on
		let formSection;
		if (!teamID) {
			// if no team selected, show default screen
			formSection = <Empty description="No team selected." />;
		} else if (formError) {
			// if team selected but error in getting team's form, show error
			formSection = (
				<Alert
					message="Cannot get form for selected team. Please try again or reach out to an organizer."
					type="error"
				/>
			);
		} else if (!formData) {
			// team selected without error, wait for loading
			formSection = <Skeleton />;
		} else {
			// everything succeeded, show judging form
			formSection = <JudgingForm formData={formData} onSubmit={onSubmit} />;
		}
		pageContent = (
			<Space direction="vertical" style={{ width: '100%' }}>
				<TeamSelect teamsData={teamsData} currentTeamID={teamID} handleChange={setTeamID} />
				<Divider />
				{formSection}
			</Space>
		);
	}

	return (
		<Outline>
			<h1>Judging Form</h1>
			{pageContent}
		</Outline>
	);
}
