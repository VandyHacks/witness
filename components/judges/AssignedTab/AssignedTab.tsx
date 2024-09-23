import { Divider, Skeleton } from 'antd';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import JudgingForm from '../AssignedTab/JudgingForm';
import { JudgeSchedule } from '../AssignedTab/JudgingSchedule';
import TeamSelect from '../AssignedTab/TeamSelect';
import { JudgingFormFields, TeamSelectData } from '../../../types/client';
import { JudgingSessionData, ResponseError, UserData } from '../../../types/database';
import { ScopedMutator } from 'swr/dist/types';
import { AccentColor, Theme, ThemeContext } from '../../../theme/themeProvider';
import { handleSubmitSuccess, handleSubmitFailure } from '../../../lib/helpers';
import { useCustomSWR, RequestType } from '../../../utils/request-utils';

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
		if (isNewForm) window.location.reload();
		setIsNewForm(false);
	} else {
		handleSubmitFailure(await res.text());
	}
}

export const AssignedTab = () => {
	const [teamID, setTeamID] = useState('');
	const [isNewForm, setIsNewForm] = useState(false);
	const { mutate } = useSWRConfig();

	const { setAccentColor, setBaseTheme } = useContext(ThemeContext);

	// Get data for teams dropdown
	const { data: teamsData, error: teamsError } = useSWR('/api/teams', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of teams.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as TeamSelectData[];
	});

	// User data
	const { data: userData, error: judgeError } = useCustomSWR<UserData>({
		url: '/api/user-data',
		method: RequestType.GET,
		errorMessage: 'Failed to get judge object.',
	});

	// Set theme
	useEffect(() => {
		if (userData && userData.settings && userData.settings.accentColor && userData.settings.baseTheme) {
			setAccentColor(userData.settings.accentColor as AccentColor);
			setBaseTheme(userData.settings.baseTheme as Theme);
		}

		if (judgeError) {
			setAccentColor(AccentColor.MONOCHROME);
			setBaseTheme(Theme.DARK);
		}
	}, [userData, setAccentColor, setBaseTheme, judgeError]);

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

	const { data: scheduleData, error: scheduleError } = useSWR('/api/judging-sessions', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as JudgingSessionData[];
	});

	const handleTeamChange: Dispatch<SetStateAction<string>> = e => {
		setTeamID(e);
		setTimeout(() => {
			window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
		}, 200);
	};

	return (
		<>
			{scheduleData && <JudgeSchedule data={scheduleData} handleChange={handleTeamChange} />}
			<br />
			<br />
			{teamsData && <TeamSelect teamsData={teamsData} currentTeamID={teamID} handleChange={handleTeamChange} />}
			{(!scheduleData || !teamsData) && <Skeleton />}
			<Divider />
			{formData && (
				<JudgingForm
					formData={formData}
					isNewForm={isNewForm}
					onSubmit={formData => handleSubmit(formData, mutate, teamID, isNewForm, setIsNewForm)}
				/>
			)}
			{!formData && teamID && <Skeleton />}
		</>
	);
};
