import { Button, Divider, notification, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ScopedMutator } from 'swr/dist/types';
import JudgingForm from '../components/judgingForm';
import { JudgeSchedule } from '../components/schedule';
import TeamSelect from '../components/teamSelect';
import { JudgingFormFields, ScheduleDisplay, TeamSelectData } from '../types/client';
import { JudgingSessionData, ResponseError, TeamData } from '../types/database';
import { signOut, useSession } from 'next-auth/react';

const GENERIC_ERROR_MESSAGE = 'Oops, something went wrong!';
const GENERIC_ERROR_DESCRIPTION = 'Please try again or contact an organizer if the problem persists.';
// let { JUDGING_LENGTH } = process.env;
const JUDGING_LENGTH = '600000';

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

export default function JudgeDash() {
	const [teamID, setTeamID] = useState('');
	const [currentScheduleItem, setCurrentScheduleItem] = useState<JudgingSessionData | undefined>(undefined);
	const [nextScheduleItem, setNextScheduleItem] = useState<JudgingSessionData | undefined>(undefined);
	const [nextIndex, setNextIndex] = useState(-1);
	const { mutate } = useSWRConfig();
	const judgingLength = parseInt(JUDGING_LENGTH || '0');
	const { data: session, status } = useSession();

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

	const [isNewForm, setIsNewForm] = useState(false);
	// Get data for form component, formData will be falsy if teamId is not yet set.
	const { data: formData, error: formError } = useSWR(
		() => (teamID ? ['/api/judging-form', teamID] : null),
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

	const { data: scheduleData, error: scheduleError } = useSWR('/api/judging-sessions', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as JudgingSessionData[];
	});

	// Initialize state if data was just received
	useEffect(() => {
		if (nextIndex === -1 && scheduleData) {
			const now = Date.now();
			let index = scheduleData.findIndex(el => now < new Date(el.time as string).getTime());
			if (index === -1) index = scheduleData.length;
			let currentlyGoingTime = new Date(scheduleData[index - 1]?.time as string).getTime() + judgingLength;
			setNextScheduleItem(scheduleData[index]);
			setCurrentScheduleItem(now < currentlyGoingTime ? scheduleData[index - 1] : undefined);
			setNextIndex(index);
		}
	}, [scheduleData, nextIndex, judgingLength]);

	// Loop to manage current schedule state
	useEffect(() => {
		const interval = setInterval(() => {
			const now = Date.now();
			if (scheduleData && nextIndex > -1) {
				// Data has been received and state is initialized
				let time2 = new Date(scheduleData[scheduleData.length - 1]?.time as string).getTime() + judgingLength;
				if (now <= time2) {
					// Not yet done judging
					let time3 = new Date((currentScheduleItem?.time as string) || 0).getTime() + judgingLength;

					if (
						nextIndex < scheduleData.length &&
						now >= new Date((nextScheduleItem?.time as string) || 0).getTime()
					) {
						// Next event should be current
						setNextScheduleItem(scheduleData[nextIndex + 1]);
						setCurrentScheduleItem(scheduleData[nextIndex]);
						setNextIndex(nextIndex + 1);
					} else if (now > time3) {
						// Next event has not yet arrived but current event is over
						setCurrentScheduleItem(undefined);
					}
				} else {
					// Done judging
					setCurrentScheduleItem(undefined);
				}
			}
		}, 1000);
		return () => clearInterval(interval);
	});

	return (
		<>
			<div style={{ display: 'flex' }}>
				<Button size="small" type="default" onClick={() => signOut()}>
					Sign out
				</Button>
				<div style={{ paddingLeft: '10px' }}>Signed in as {session?.user?.email}</div>
			</div>
			{scheduleData && <JudgeSchedule data={scheduleData} cutoffIndex={0} handleChange={setTeamID} />}
			<br />
			<br />
			{teamsData && <TeamSelect teamsData={teamsData} currentTeamID={teamID} handleChange={setTeamID} />}
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
}
