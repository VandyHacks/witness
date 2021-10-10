import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/client';
import Scores from '../../models/scores';
import Team from '../../models/team';
import { JudgingFormFields } from '../../types/client';
import log from '../../middleware/log';

export default async function handler(req: NextApiRequest, res: NextApiResponse<JudgingFormFields | string>) {
	const teamID = req.query.id;
	const session = await getSession({ req });
	if (session?.userType !== 'JUDGE') return res.status(403).send('Forbidden');
	const judgeID = session.userID;
	await dbConnect();

	switch (req.method) {
		case 'GET': {
			const scores = await Scores.findOne({ team: teamID, judge: judgeID });
			if (!scores) return res.status(404).send('No scores found for specified team');

			return res.status(200).json(scores);
		}
		case 'POST': {
			const scoresDoc = new Scores({ team: teamID, judge: judgeID, ...req.body });
			const scores = await scoresDoc.save();

			const team = await Team.findById(teamID);
			team.scores = scores.id;

			await log(judgeID, `Submitted scores for team ${team.name} (join code ${team.joinCode})`);

			await team.save();
			return res.status(201).send(scores);
		}
		case 'PATCH': {
			const scores = await Scores.findOneAndUpdate(
				{ team: teamID, judge: judgeID },
				{ team: teamID, judge: judgeID, ...req.body }
			);

			await log(judgeID, `Updated scores for team ${teamID} (join code ${team.joinCode})`);
			return res.status(scores ? 200 : 409).send(scores);
		}
		default:
			return res.status(405).send('Method not supported brother');
	}
}
