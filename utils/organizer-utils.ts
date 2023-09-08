import { ScopedMutator } from 'swr/dist/types';
import { ManageFormFields } from '../components/manageRoleForm';
import { generateTimes } from '../components/schedule';
import { handleSubmitSuccess, handleSubmitFailure } from '../lib/helpers';
import { JudgingSessionData, PreAddData, TeamData, UserData } from '../types/database';

/**
 * The number of times each team will be judged.
 * @type {number}
 */
export const TIMES_JUDGED = 3;

/**
 * Generates schedule sessions for Teams A based on the given array of teams and judges.
 * @param {TeamData[]} teams - The array of team data objects to generate sessions for.
 * @param {UserData[]} judges - The array of user data objects from which judges will be selected.
 * @returns {Array} An array of schedule session data objects for Teams A.
 */
export const generateScheduleA = (teams: TeamData[], judges: UserData[]) => {
	const teamsPerSession = Math.floor(teams.length / 2);

	const timesOne = generateTimes(new Date('2022-10-23T10:00:00'), new Date('2022-10-23T11:00:00'), 10);

	const sessionsA = matchTeams(teams.slice(0, teamsPerSession), judges, timesOne);

	return sessionsA;
};

/**
 * Generates schedule sessions for Teams B based on the given array of teams and judges.
 * @param {TeamData[]} teams - The array of team data objects to generate sessions for.
 * @param {UserData[]} judges - The array of user data objects from which judges will be selected.
 * @returns {Array} An array of schedule session data objects for Teams B.
 */
export const generateScheduleB = (teams: TeamData[], judges: UserData[]) => {
	const teamsPerSession = Math.floor(teams.length / 2);

	const timesTwo = generateTimes(new Date('2022-10-23T11:30:00'), new Date('2022-10-23T12:30:00'), 10);

	const sessionsB = matchTeams(teams.slice(teamsPerSession, teams.length), judges, timesTwo);

	return sessionsB;
};

/**
 * Handles submission of the Manage Form with the specified role data.
 * @param {ManageFormFields} roleData - The form data for the role being managed.
 * @param {ScopedMutator} mutate - The scoped mutator function to update the query cache.
 */
export const handleManageFormSubmit = async (roleData: ManageFormFields, mutate: ScopedMutator<any>) => {
	const res = await fetch(`/api/manage-role`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ formData: roleData }),
	});

	if (res.ok) {
		mutate('/api/manage-role');
		handleSubmitSuccess();
	} else handleSubmitFailure(await res.text());
};

/**
 * Handles pre-add user deletion with the specified user data.
 * @param {PreAddData} user - The user data object to be deleted from pre-add.
 * @param {ScopedMutator} mutate - The scoped mutator function to update the query cache.
 * @returns {void}
 * @throws {Error} If the deletion fails with an error response.
 */
export const handlePreAddDelete = async (user: PreAddData, mutate: ScopedMutator<any>) => {
	console.log('logging user obj', user);
	const res = await fetch('/api/preadd', {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ userId: user._id }),
	});

	if (res.ok) {
		mutate('/api/preadd');
		handleSubmitSuccess(await res.text());
	} else handleSubmitFailure(await res.text());
};

/**
 * Matches the specified array of teams with the given array of judges and generates an array of session data objects
 * for each time slot based on the number of sessions per time slot.
 * @param {TeamData[]} teams - The array of team data objects to match with judges.
 * @param {UserData[]} judges - The array of user data objects from which judges will be selected.
 * @param {Date[]} times - The array of time slots for which to generate sessions.
 * @returns {Array} An array of schedule session data objects.
 */
export const matchTeams = (teams: TeamData[], judges: UserData[], times: Date[]) => {
	let sessions = [];

	const numSessions = TIMES_JUDGED * teams.length;

	const perTimes = Math.floor(numSessions / times.length);
	let remTimes = numSessions % times.length;

	let teamIdx = 0;
	let judgeIdx = 0;

	// Generate sessions for each time slot based on the number of sessions per time slot and the remaining sessions
	for (let i = 0; i < times.length; i++) {
		const currSessions = perTimes + (remTimes > 0 ? 1 : 0);
		remTimes--;
		for (let j = 0; j < currSessions; j++) {
			sessions.push({
				team: teams[teamIdx],
				judge: judges[judgeIdx],
				time: times[i].toISOString() as String,
			});
			teamIdx = (teamIdx + 1) % teams.length;
			judgeIdx = (judgeIdx + 1) % judges.length;
		}
	}

	return sessions;
};

/**
 * Handles submission of confirmed judging sessions with the specified array of judging session data.
 * @param {JudgingSessionData[]} judgingSessions - The array of judging session data objects to submit.
 * @returns {void}
 */
export const handleConfirmSchedule = async (judgingSessions: JudgingSessionData[]) => {
	const res = await fetch('/api/confirm-judging-sessions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			newJudgingSessions: judgingSessions,
		}),
	});

	if (res.ok) {
		handleSubmitSuccess(await res.text());
	} else handleSubmitFailure(await res.text());
};
