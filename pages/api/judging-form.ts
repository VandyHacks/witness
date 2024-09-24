import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../middleware/database';
import log from '../../middleware/log';
import { JudgingFormFields } from '../../types/client';
import Scores from '../../models/scores';
import Team from '../../models/team';

/**
 * checks if judging form is valid
 * @param judgingForm inputted judging form
 * @returns if judging form is valid, return the form; otherwise, return string containing why it is invalid
 */
async function validateJudgingForm(judgingForm: any): Promise<string | JudgingFormFields> {
	if (judgingForm['comments'] === '') {
		return 'Comments cannot be empty.';
	}
	if (judgingForm['feedback'] === '') {
		return 'Feedback cannot be empty.';
	}
	return judgingForm;
}

/**
 * validates and updates/submits judging form
 * @param req request containing the team that is scored
 * @param res response
 * @returns response containing the submitted scores
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<JudgingFormFields | string>) {
	// team that is judged
	const teamID = req.query.id;
	const session = await getSession({ req });

	// only a judge can access the judging form
	if (session?.userType !== 'JUDGE') return res.status(403).send('Forbidden');
	const judgeID = session.userID;
	await dbConnect();

	switch (req.method) {
		// find score for the team given by the judge
		case 'GET': {
			const scores = await Scores.findOne({ team: teamID, judge: judgeID });
			if (!scores) return res.status(404).send('No scores found for specified team');

			return res.status(200).json(scores);
		}

		// validate and save scores
		case 'POST': {
			// validate judging form
			const validateResults = await validateJudgingForm(req.body);
			if (typeof validateResults === 'string') return res.status(406).send(validateResults);

			// create and save scores
			const scoresDoc = new Scores({ team: teamID, judge: judgeID, ...req.body });
			const scores = await scoresDoc.save();

			// update the scores for the team
			const team = await Team.findById(teamID);
			team.scores = scores.id;
			await log(judgeID, `Submitted scores for team ${team.name}`);
			await team.save();
			return res.status(201).send(scores);
		}

		// update scores
		case 'PATCH': {
			// validate judging form
			const validateResults = await validateJudgingForm(req.body);
			if (typeof validateResults === 'string') return res.status(406).send(validateResults);

			// update the scores
			const scores = await Scores.findOneAndUpdate(
				{ team: teamID, judge: judgeID },
				{ team: teamID, judge: judgeID, ...req.body }
			);

			const team = await Team.findById(teamID);
			await log(judgeID, `Update scores for team ${team.name}`);
			if (scores) {
				return res.status(200).send(scores);
			} else {
				return res.status(409).send('Please try again or contact an organizer if the problem persists.');
			}
		}

		// invalid method
		default:
			return res.status(405).send('Method not supported brother');
	}
}
