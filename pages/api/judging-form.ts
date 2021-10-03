import type { NextApiRequest, NextApiResponse } from 'next';

export interface JudgingFormData {
	technicalAbility: number;
	creativity: number;
	utility: number;
	presentation: number;
	wowFactor: number;
	comments: string;
	feedback: string;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<JudgingFormData | ''>): void {
	if (req.method === 'GET') {
		// TODO: these are just fillers. Actually implement this route.
		const teamID = req.query.id;
		if (teamID == '0') {
			res.status(200).json({
				technicalAbility: 5,
				creativity: 2,
				utility: 7,
				presentation: 4,
				wowFactor: 1,
				comments: 'This project sucked.',
				feedback: 'Great job!',
			});
		} else if (teamID == '1') {
			res.status(200).json({
				technicalAbility: 1,
				creativity: 3,
				utility: 2,
				presentation: 7,
				wowFactor: 7,
				comments: 'I love VandyHacks.',
				feedback: 'Aadi suxx booty.',
			});
		} else if (teamID == '2') {
			res.status(200).json({
				technicalAbility: 0,
				creativity: 1,
				utility: 0,
				presentation: 1,
				wowFactor: 0,
				comments: 'I hate VandyHacks.',
				feedback: 'Aadi suxx no booty.',
			});
		} else {
			res.status(404).send('');
		}
	} else if (req.method === 'POST') {
		res.status(200).send('');
	}
}
