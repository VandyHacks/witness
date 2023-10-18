import { ScopedMutator } from 'swr/dist/types';
import { handleSubmitSuccess, handleSubmitFailure } from '../lib/helpers';
import { JudgingSessionData, PreAddData, TeamData, UserData } from '../types/database';

/**
 * Handles pre-add user deletion with the specified user data.
 * @param {PreAddData} user - The user data object to be deleted from pre-add.
 * @param {ScopedMutator} mutate - The scoped mutator function to update the query cache.
 * @returns {void}
 * @throws {Error} If the deletion fails with an error response.
 */
export const handlePreAddDelete = async (user: PreAddData, mutate: ScopedMutator) => {
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
export const matchTeams = (teams: TeamData[], judges: UserData[], times: Date[], timesJudged: number) => {
	let sessions = [];

	const numSessions = timesJudged * teams.length;

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
