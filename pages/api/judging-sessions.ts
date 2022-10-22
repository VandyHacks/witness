import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import JudgingSession from '../../models/JudgingSession';

async function getHackerSchedule(res: NextApiResponse) {
	return res.status(403).send('Forbidden');
}

async function getOrganizerSchedule(res: NextApiResponse) {
	const data = await JudgingSession.find();
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
			break;
		case 'JUDGE':
			break;
	}
}
