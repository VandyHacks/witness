import { Divider, Space, Skeleton, Alert, notification, Empty } from 'antd';
import React, { useEffect, useState } from 'react';
import JudgingForm from '../components/judgingForm';
import Outline from '../components/outline';
import TeamSelect from '../components/teamSelect';
import useSWR, { useSWRConfig } from 'swr';
import { useRouter } from 'next/router';
import { JudgingFormData } from './api/judging-form';
import { TeamsData } from './api/team-select';
import { ScopedMutator } from 'swr/dist/types';
import { signIn, useSession } from 'next-auth/client';
import { ResponseError } from '../types/types';
import ErrorMessage from '../components/errorMessage';

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

async function handleSubmit(formData: JudgingFormData, mutate: ScopedMutator<any>) {
	const res = await fetch('/api/judging-form', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	});

	if (res.ok) {
		mutate('/api/team-select');
		handleSubmitSuccess();
	} else handleSubmitFailure();
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
		if (!res.ok) {
			const error = new Error('Failed to get list of teams.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as TeamsData[];
	});

	// Get data for form component, formData will be falsy if teamID is not yet set.
	const { data: formData, error: formError } = useSWR(
		() => (teamID ? ['/api/judging-form', teamID] : null),
		async (url, id) => {
			const res = await fetch(`${url}?id=${id}`, { method: 'GET' });
			if (!res.ok) {
				const error = new Error('Failed to get form information.') as ResponseError;
				error.status = res.status;
				throw error;
			}
			return (await res.json()) as JudgingFormData;
		}
	);
	// Get mutate function to reload teams list with updated data on form submission.
	const { mutate } = useSWRConfig();

	const [session, loading] = useSession();
	if (!loading && !session) return signIn();

	let pageContent;
	if (teamsError) {
		// if error fetching teams, everything dies
		pageContent = <ErrorMessage status={teamsError.status} />;
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
			formSection = <ErrorMessage status={formError.status} />;
		} else if (!formData) {
			// team selected without error, wait for loading
			formSection = <Skeleton />;
		} else {
			// everything succeeded, show judging form
			formSection = <JudgingForm formData={formData} onSubmit={formData => handleSubmit(formData, mutate)} />;
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
		<Outline selectedKey="forms">
			<h1>Judging</h1>
			{pageContent}
		</Outline>
	);
}
