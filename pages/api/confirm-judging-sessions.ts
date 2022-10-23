import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import JudgingSession from '../../models/JudgingSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'POST':
            const { newJudgingSessions } = req.body;
            if (!newJudgingSessions || newJudgingSessions.length === 0) return res.status(400).send('Please send a new array of judging sessions');

            await JudgingSession.collection.drop();
            await JudgingSession.insertMany(newJudgingSessions);
            return res.status(200).send(`Checked in new Judging Sessons into judgingSessions collection`);
		default:
			return res.status(405).send('Method not supported brother');
	}
}