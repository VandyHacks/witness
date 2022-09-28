import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import { ApplicationStatus } from '../../types/database';
import sendEmail from './email/email';
import rejected from './email/templates/rejected';
import accepted from './email/templates/accepted';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'HACKER') {
		res.send(403);
		return;
	}

	if (!session || !session.user || !session.user.email) {
		res.send(403);
		return;
	}

	await dbConnect();
	switch (req.method) {
		case 'POST':
			let user = await User.findOne({ email: session.user.email });
			if (!('applicationStatus' in user) || user.applicationStatus !== ApplicationStatus.SUBMITTED) {
				res.send(403);
				return;
			}

            if (![ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED].includes(req.body.applicationStatus)) {
                res.send(403);
                return;
            }

            user.updateOne({ applicationStatus: req.body.applicationStatus });
            if (req.body.applicationStatus === ApplicationStatus.ACCEPTED) {
                await sendEmail(accepted(user));
            } else if (req.body.applicationStatus === ApplicationStatus.REJECTED) {
                await sendEmail(rejected(user));
            }

			return res.send(200);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
