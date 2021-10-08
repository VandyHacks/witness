import { Divider, Space, Skeleton, Alert, notification, Empty } from 'antd';
import React, { useEffect, useState } from 'react';
import JudgingForm from '../components/judgingForm';
import Outline from '../components/outline';
import TeamSelect from '../components/teamSelect';
import useSWR, { useSWRConfig } from 'swr';
import { useRouter } from 'next/router';
import { JudgingFormFields } from '../types/client';
import { TeamsData } from './api/teams';
import { ScopedMutator } from 'swr/dist/types';
import { signIn, useSession } from 'next-auth/client';
import { ResponseError } from '../types/database';
import ErrorMessage from '../components/errorMessage';

function handleSubmitSuccess(isNew: boolean) {
	notification['success']({
		message: `Successfully ${isNew ? 'submitted' : 'updated'}!`,
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

async function handleSubmit(
	formData: JudgingFormFields,
	mutate: ScopedMutator<any>,
	teamId: string,
	isNewForm: boolean
) {
	const res = await fetch(`/api/judging-form?id=${teamId}`, {
		method: isNewForm ? 'POST' : 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	});

	if (res.ok) {
		mutate('/api/teams');
		handleSubmitSuccess(isNewForm);
	} else handleSubmitFailure();
}

export default function Forms() {
	// Use query string to get team ID
	const router = useRouter();
	let { id: idFromQueryString } = router.query;
	const [teamId, setTeamID] = useState(idFromQueryString as string | undefined);

	useEffect(() => {
		setTeamID(idFromQueryString as string | undefined);
	}, [idFromQueryString]);

	// Get data for teams dropdown
	const { data: teamsData, error: teamsError } = useSWR('/api/teams', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of teams.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as TeamsData[];
	});

	const [isNewForm, setIsNewForm] = useState(false);
	// Get data for form component, formData will be falsy if teamId is not yet set.
	const { data: formData, error: formError } = useSWR(
		() => (teamId ? ['/api/judging-form', teamId] : null),
		async (url, id) => {
			const res = await fetch(`${url}?id=${id}`, { method: 'GET' });
			if (!res.ok) {
				if (res.status === 404) {
					const emptyJudgeForm = {
						technicalAbility: 0,
						creativity: 0,
						utility: 0,
						presentation: 0,
						wowFactor: 0,
						comments: '',
						feedback: '',
					} as JudgingFormFields;
					setIsNewForm(true);
					return emptyJudgeForm;
				}
				const error = new Error('Failed to get form information.') as ResponseError;
				error.status = res.status;
				throw error;
			}
			return (await res.json()) as JudgingFormFields;
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
		if (!teamId) {
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
			formSection = (
				<JudgingForm
					formData={formData}
					isNewForm={isNewForm}
					onSubmit={formData => handleSubmit(formData, mutate, teamId, isNewForm)}
				/>
			);
		}
		pageContent = (
			<Space direction="vertical" style={{ width: '100%' }}>
				<TeamSelect teamsData={teamsData} currentTeamID={teamId} handleChange={setTeamID} />
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
