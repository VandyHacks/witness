import useSWR, { useSWRConfig } from 'swr';
import { ResponseError, TeamData } from '../../../types/database';
import { AllTeamsForm } from './AllTeamsForm';
import { Dispatch, SetStateAction, useState } from 'react';
import { JudgingFormFields } from '../../../types/client';
import JudgingForm from '../AssignedTab/JudgingForm';
import { ScopedMutator } from 'swr/dist/types';
import { handleSubmitFailure, handleSubmitSuccess } from '../../../lib/helpers';

async function handleSubmit(
	formData: JudgingFormFields,
	mutate: ScopedMutator,
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
		handleSubmitSuccess(`Successfully ${isNewForm ? 'submitted' : 'updated'}!`);
		setIsNewForm(false);
	} else {
		handleSubmitFailure(await res.text());
	}
}

export const AllTeamsTab = () => {
	const [teamID, setTeamID] = useState('');
	const [isNewForm, setIsNewForm] = useState(false);
	const { mutate } = useSWRConfig();

	// Get data for all teams
	const { data: teamsData, error: teamsError } = useSWR('/api/teams-all', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of teams.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as TeamData[];
	});

	// Get data for form component, formData will be false if teamId is not yet set.
	const { data: formData, error: formError } = useSWR(
		() => (teamID ? ['/api/judging-form', teamID] : null),
		async (url: any, id: any) => {
			const res = await fetch(`${url}?id=${id}`, { method: 'GET' });
			if (!res.ok) {
				if (res.status === 404) {
					const emptyJudgeForm: JudgingFormFields = {
						technicalAbility: 0,
						creativity: 0,
						utility: 0,
						presentation: 0,
						wowFactor: 0,
						comments: '',
						feedback: '',
					};
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

	const teams = teamsData?.map(x => ({ ...x, key: x._id })) || ([] as TeamData[]);
	const currentTeam = teams.find(team => String(team._id) === teamID);

	const handleTeamChange: Dispatch<SetStateAction<string>> = e => {
		setTeamID(e);
		setTimeout(() => {
			window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
		}, 200);
	};

	return (
		<>
			{teamsError ? (
				<div>{(teamsError as ResponseError).message || 'Failed to get data.'}</div>
			) : (
				<>
					<AllTeamsForm teamsData={teams} handleTeamChange={handleTeamChange} teamId={teamID} />
					{formData && (
						<>
							<p
								style={{
									fontSize: '1.5rem',
									fontWeight: 'bold',
									color: 'black',
								}}>
								{currentTeam?.name}
							</p>
							<JudgingForm
								formData={formData}
								isNewForm={isNewForm}
								onSubmit={formData => handleSubmit(formData, mutate, teamID, isNewForm, setIsNewForm)}
							/>
						</>
					)}
				</>
			)}
		</>
	);
};
