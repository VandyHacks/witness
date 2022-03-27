import { Divider, Space, Skeleton, notification, Empty } from 'antd';
import React, { useEffect, useState } from 'react';
import JudgingForm from '../components/judgingForm';
import AllScores from '../components/allScores';
import Outline from '../components/outline';
import TeamSelect from '../components/teamSelect';
import useSWR, { useSWRConfig } from 'swr';
import { useRouter } from 'next/router';
import { JudgingFormFields } from '../types/client';
import { TeamSelectData } from '../types/client';
import { TeamData, ScoreData, UserData } from '../types/database';
import { ScopedMutator } from 'swr/dist/types';
import { signIn, useSession } from 'next-auth/react';
import { ResponseError } from '../types/database';
import ErrorMessage from '../components/errorMessage';

const GENERIC_ERROR_MESSAGE = 'Oops, something went wrong!';
const GENERIC_ERROR_DESCRIPTION = 'Please try again or contact an organizer if the problem persists.';

function handleSubmitSuccess(isNew: boolean, setIsNewForm: React.Dispatch<React.SetStateAction<boolean>>) {
	notification['success']({
		message: `Successfully ${isNew ? 'submitted' : 'updated'}!`,
		placement: 'bottomRight',
	});
	setIsNewForm(false);
}

function handleSubmitFailure(errorDescription: string) {
	if (errorDescription === '') {
		errorDescription = GENERIC_ERROR_DESCRIPTION;
	}
	notification['error']({
		message: GENERIC_ERROR_MESSAGE,
		description: errorDescription,
		placement: 'bottomRight',
	});
}

async function handleSubmit(
	formData: JudgingFormFields,
	mutate: ScopedMutator<any>,
	teamId: string,
	isNewForm: boolean,
	setIsNewForm: React.Dispatch<React.SetStateAction<boolean>>
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
		mutate('/api/judging-form');
		handleSubmitSuccess(isNewForm, setIsNewForm);
	} else {
		handleSubmitFailure(await res.text());
	}
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
		// Type is TeamSelectData[] for judges and TeamData[] for organizers
		return (await res.json()) as TeamSelectData[] | TeamData[];
	});

	const { data: scoresData, error: scoresError } = useSWR('/api/scores', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of scores.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as ScoreData[];
	});

	const { data: usersData, error: usersError } = useSWR('/api/users?usertype=JUDGE', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of judges.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as UserData[];
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
			setIsNewForm(false);
			return (await res.json()) as JudgingFormFields;
		}
	);
	// Get mutate function to reload teams list with updated data on form submission.
	const { mutate } = useSWRConfig();

	const { data: session, status } = useSession();
	const loading = status === 'loading';
	if (!loading && !session) return signIn();

	let pageContent;
	if (teamsError) {
		// if error fetching teams, everything dies
		pageContent = <ErrorMessage status={teamsError.status} />;
	} else if (scoresError && session?.userType === 'ORGANIZER') {
		pageContent = <ErrorMessage status={scoresError.status} />;
	} else if ((!scoresData && session?.userType === 'ORGANIZER') || !teamsData) {
		// otherwise, wait for TeamSelectData to load
		pageContent = <Skeleton />;
	} else {
		// TeamSelectData loaded, moving on
		let formSection;
		if (!teamId) {
			// if no team selected, show default screen
			formSection = <Empty description="No team selected." />;
		} else if (formError) {
			// if team selected but error in getting team's form, show error
			formSection = <ErrorMessage status={formError.status} />;
			{
				session?.userType === 'ORGANIZER' &&
					// everything succeeded, show judging form
					(formSection = (
						<AllScores
							teamData={teamsData as TeamData[]}
							scoreData={scoresData!}
							userData={usersData as UserData[]}
						/>
					));
			}
		} else if (!formData) {
			// team selected without error, wait for loading
			formSection = <Skeleton />;
		} else {
			// everything succeeded, show judging form
			formSection = (
				<JudgingForm
					formData={formData}
					isNewForm={isNewForm}
					onSubmit={formData => handleSubmit(formData, mutate, teamId, isNewForm, setIsNewForm)}
				/>
			);
		}
		pageContent = (
			<Space direction="vertical" style={{ width: '100%' }}>
				<TeamSelect teamsData={teamsData as TeamSelectData[]} currentTeamID={teamId} handleChange={setTeamID} />
				<Divider />
				{formSection}
			</Space>
		);
	}

	return (
		<Outline selectedKey="judging">
			<h1>Judging</h1>
			{pageContent}
		</Outline>
	);
}

export async function getStaticProps() {
	return {
		props: { title: 'Judging' },
	};
}
