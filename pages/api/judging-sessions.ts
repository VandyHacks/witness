import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import JudgingSession from '../../models/JudgingSession';
import Team from '../../models/team';
import User from '../../models/user';

async function getHackerSchedule(res: NextApiResponse) {
	return res.status(403).send('Forbidden');
}

async function getOrganizerSchedule(res: NextApiResponse) {
	Team;
	User; // Don't remove or the import will get optimized out and the populate will fail
	const data = await JudgingSession.find()
		.populate('team judge')
		.populate({ path: 'team', populate: { path: 'members' } })
		.lean();
	return res.status(200).send(data);
}

async function getJudgeSchedule(res: NextApiResponse, userID: string) {
	Team;
	User; // Don't remove or the import will get optimized out and the populate will fail
	const data = await JudgingSession.find({ judge: userID })
		.populate('team judge')
		.populate({ path: 'team', populate: { path: 'members' } })
		.lean();
	return res.status(200).send(data);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	const userType = session?.userType;
	switch (userType) {
		case 'HACKER':
			return getHackerSchedule(res);
		case 'ORGANIZER':
			return getOrganizerSchedule(res);
		case 'JUDGE':
			return getJudgeSchedule(res, session?.userID as string);
		default:
			return res.status(403).send('Forbidden');
	}
}
