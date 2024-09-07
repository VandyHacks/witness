import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import JudgingSession from '../../models/JudgingSession';
import Team from '../../models/team';
import User from '../../models/user';
import Scores from '../../models/scores';
import { ObjectId } from 'mongodb';
import { ScoreData } from '../../types/database';

/**
 * gets a judging schedule for a team
 * @param res response
 * @param userID ID of the team
 * @returns response containing judging schedule
 */
async function getHackerSchedule(res: NextApiResponse, userID: string) {
	const team = await Team.findOne({ members: userID });
	const data = await JudgingSession.find({ team: team }).populate('team judge').lean();
	return res.status(200).send(data);
}

/**
 * gets judging schedules for all teams
 * @param res response
 * @returns response containing judging schedule for all teams
 */
async function getOrganizerSchedule(res: NextApiResponse) {
	Team;
	User; // Don't remove or the import will get optimized out and the populate will fail
	const data = await JudgingSession.find()
		.populate('team judge')
		.populate({ path: 'team', populate: { path: 'members' } })
		.lean();
	return res.status(200).send(data);
}

/**
 * gets judging schedule for a judge
 * @param res response
 * @param userID ID of the judge
 * @returns response containing judging schedule for a judge
 */
async function getJudgeSchedule(res: NextApiResponse, userID: ObjectId) {
	Team;
	User; // Don't remove or the import will get optimized out and the populate will fail
	const data = await JudgingSession.find({ judge: userID })
		.populate('team judge')
		.populate({ path: 'team', populate: { path: 'members' } })
		.lean();

	// whether the team in the session is judged
	const teamsJudged = await Scores.find({ judge: userID }).select('team');
	const teamsJudgedIDs = teamsJudged.map(teamItem => teamItem.team.toString());
	data.forEach(judgingSession => {
		judgingSession.haveJudged = teamsJudgedIDs.includes(judgingSession.team._id.toString());
	});
	return res.status(200).send(data);
}

/**
 * gets the correct judging schedule(s) for a specific user (hacker, judge, or organizer)
 * @param req request containing the user type
 * @param res response
 * @returns response containing the correct judging schedule(s)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	const userType = session?.userType;
	switch (userType) {
		case 'HACKER':
			return getHackerSchedule(res, session?.userID as string);
		case 'ORGANIZER':
			return getOrganizerSchedule(res);
		case 'JUDGE':
			return getJudgeSchedule(res, session?.userID as ObjectId);
		default:
			return res.status(403).send('Forbidden');
	}
}
