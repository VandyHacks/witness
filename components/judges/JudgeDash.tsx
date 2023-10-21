import { Divider, Skeleton } from 'antd';
import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import JudgingForm from './JudgingForm';
import { JudgeSchedule } from './schedule';
import TeamSelect from './TeamSelect';
import { JudgingFormFields, TeamSelectData } from '../../types/client';
import { JudgingSessionData, ResponseError } from '../../types/database';
import { signOut, useSession } from 'next-auth/react';
import { ScopedMutator } from 'swr/dist/types';
import ThemeControl from '../Organizer/SettingsTab/ThemeControl';
import { getAccentColor, getBaseColor, getThemedClass, ThemeContext } from '../../theme/themeProvider';
import styles from '../../styles/Judge.module.css';
import { handleSubmitSuccess } from '../../lib/helpers';
import Link from 'next/link';
import { BugOutlined } from '@ant-design/icons';

// let { JUDGING_LENGTH } = process.env;
const JUDGING_LENGTH = '600000';

function handleSubmitFailure(errorDescription: string) {
	handleSubmitFailure('Ooops, something went wrong!');
}

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

export default function JudgeDash() {
	const { data: session, status } = useSession();
	const [teamID, setTeamID] = useState('');
	const [currentScheduleItem, setCurrentScheduleItem] = useState<JudgingSessionData | undefined>(undefined);
	const [nextScheduleItem, setNextScheduleItem] = useState<JudgingSessionData | undefined>(undefined);
	const [nextIndex, setNextIndex] = useState(-1);
	const { mutate } = useSWRConfig();
	const judgingLength = parseInt(JUDGING_LENGTH || '0');

	const { baseTheme, accentColor } = useContext(ThemeContext);

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

	const handleTeamChange: Dispatch<SetStateAction<string>> = e => {
		setTeamID(e);
		setTimeout(() => {
			window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
		}, 200);
	};

	return (
		<div>
			<div className={styles[getThemedClass('judgeHeader', baseTheme)]}>
				<h1 className={styles[getThemedClass('judgeTitle', baseTheme)]}>Judging Dashboard</h1>
				<div className={styles[getThemedClass('judgeHeaderEmail', baseTheme)]}>
					<div className={styles[getThemedClass('judgeHeaderEmailText', baseTheme)]}>
						{session?.user?.email}
					</div>
					<div>
						<button
							className={styles[getThemedClass('judgeButton', baseTheme)]}
							style={{
								backgroundColor: getAccentColor(accentColor, baseTheme),
							}}
							onClick={() => signOut()}>
							Sign out
						</button>
					</div>
				</div>
			</div>
			{scheduleData && (
				<JudgeSchedule data={scheduleData} cutoffIndex={nextIndex} handleChange={handleTeamChange} />
			)}
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
			<div className={styles['theme-control-container']}>
				<ThemeControl />
			</div>
			<div className={styles['reportABugContainer']}>
				<Link href="/report">
					<div className={styles['reportABugText']}>Report a bug!</div>
				</Link>
				<BugOutlined />
			</div>
		</div>
	);
}
