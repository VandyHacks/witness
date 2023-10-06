import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import { ApplicationStatus } from '../../types/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'PATCH':
			const { judgeId, isJudgeCheckedIn } = req.body;
			if (judgeId === undefined) return res.status(400).send('judgeId (string) is required');
			if (isJudgeCheckedIn === undefined) return res.status(400).send('isJudgeCheckedIn (boolean) is required');

			const judge = await User.findOne({ _id: judgeId, userType: 'JUDGE' });
			if (!judge) return res.status(404).send('Judge not found');

			judge.isJudgeCheckedIn = isJudgeCheckedIn;
			judge.save();

			return res.status(200).send(`Judge ${judge.name} checked ${isJudgeCheckedIn ? 'in' : 'out'} successfully`);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
