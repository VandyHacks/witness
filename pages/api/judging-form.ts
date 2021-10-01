import type { NextApiRequest, NextApiResponse } from 'next';

export type JudgingFormData = {
	technicalability: number;
	creativity: number;
	utility: number;
	presentation: number;
	wowfactor: number;
	comments: string;
	feedback: string;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<JudgingFormData | null>): void {
	if (req.method === 'GET') {
		// TODO: these are just fillers. Actually implement this route.
		res.status(200).json({
			technicalability: 5,
			creativity: 2,
			utility: 7,
			presentation: 4,
			wowfactor: 1,
			comments: 'This project sucked.',
			feedback: 'Great job!',
		});
	} else if (req.method === 'POST') {
		res.status(200).send(null);
	}
}
