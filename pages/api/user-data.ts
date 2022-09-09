import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import { ApplicationStatus } from '../../types/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (!session || !session.user || !session.user.email) {
		res.send(403);
		return;
	}

	await dbConnect();
	switch (req.method) {
		case 'GET':
			let user = JSON.parse(JSON.stringify(await User.findOne({ email: session.user.email })));
			if (!('applicationStatus' in user) && user.userType === 'HACKER') {
				user.applicationStatus = ApplicationStatus.CREATED;
			}

			return res.status(200).send(user);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
