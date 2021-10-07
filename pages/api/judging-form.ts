import type { NextApiRequest, NextApiResponse } from 'next';
import Scores from '../../models/scores';
// import Team from '../../models/team';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/client';

export interface JudgingFormData {
	technicalAbility: number;
	creativity: number;
	utility: number;
	presentation: number;
	wowFactor: number;
	comments: string;
	feedback: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<JudgingFormData | string>) {
	if (req.method === 'GET') {
		const teamID = req.query.id;
		const session = await getSession({ req });
		if (session?.userType !== 'JUDGE') return res.status(403).send('Forbidden');

		const judgeID = session.userID;

		await dbConnect();

		const scores = await Scores.findOne({ team: teamID, judge: judgeID });
		if (!scores) return res.status(404).send('No scores found for specified team');

		return res.status(200).json(scores);
	}
	return res.status(405).send('Method not supported brother');

	// 	if (teamID == '0') {
	// 		res.status(200).json({
	// 			technicalAbility: 5,
	// 			creativity: 2,
	// 			utility: 7,
	// 			presentation: 4,
	// 			wowFactor: 1,
	// 			comments: 'This project sucked.',
	// 			feedback: 'Great job!',
	// 		});
	// 	} else if (teamID == '1') {
	// 		res.status(200).json({
	// 			technicalAbility: 1,
	// 			creativity: 3,
	// 			utility: 2,
	// 			presentation: 7,
	// 			wowFactor: 7,
	// 			comments: 'I love VandyHacks.',
	// 			feedback: 'Aadi suxx booty.',
	// 		});
	// 	} else if (teamID == '2') {
	// 		res.status(200).json({
	// 			technicalAbility: 0,
	// 			creativity: 1,
	// 			utility: 0,
	// 			presentation: 1,
	// 			wowFactor: 0,
	// 			comments: 'I hate VandyHacks.',
	// 			feedback: 'Aadi suxx no booty.',
	// 		});
	// 	} else {
	// 		res.status(404).send('');
	// 	}
	// } else if (req.method === 'POST') {
	// 	res.status(200).send('');
	// }
}
