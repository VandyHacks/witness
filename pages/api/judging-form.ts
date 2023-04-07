import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Scores from '../../models/scores';
import Team from '../../models/team';
import { JudgingFormFields } from '../../types/client';
import log from '../../middleware/log';

async function validateJudgingForm(judgingForm: any): Promise<string | JudgingFormFields> {
	if (judgingForm['comments'] === '') {
		return 'Comments cannot be empty.';
	}
	if (judgingForm['feedback'] === '') {
		return 'Feedback cannot be empty.';
	}
	return judgingForm;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<JudgingFormFields | string>) {
	const teamID = req.query.id;
	const session = await getSession({ req });
	if (session?.userType !== 'JUDGE') return res.status(403).send('Forbidden');
	const judgeID = session.user._id;
	await dbConnect();

	switch (req.method) {
		case 'GET': {
			const scores = await Scores.findOne({ team: teamID, judge: judgeID });
			if (!scores) return res.status(404).send('No scores found for specified team');

			return res.status(200).json(scores);
		}
		case 'POST': {
			const validateResults = await validateJudgingForm(req.body);
			if (typeof validateResults === 'string') return res.status(406).send(validateResults);
			const scoresDoc = new Scores({ team: teamID, judge: judgeID, ...req.body });
			const scores = await scoresDoc.save();

			const team = await Team.findById(teamID);
			team.scores = scores.id;

			await log(judgeID, `Submitted scores for team ${team.name} (join code ${team.joinCode})`);

			await team.save();
			return res.status(201).send(scores);
		}
		case 'PATCH': {
			const validateResults = await validateJudgingForm(req.body);
			if (typeof validateResults === 'string') return res.status(406).send(validateResults);
			const scores = await Scores.findOneAndUpdate(
				{ team: teamID, judge: judgeID },
				{ team: teamID, judge: judgeID, ...req.body }
			);

			const team = await Team.findById(teamID);
			await log(judgeID, `Update scores for team ${team.name} (join code ${team.joinCode})`);
			if (scores) {
				return res.status(200).send(scores);
			} else {
				return res.status(409).send('Please try again or contact an organizer if the problem persists.');
			}
		}
		default:
			return res.status(405).send('Method not supported brother');
	}
}
