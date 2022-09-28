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
	if (session?.userType !== 'ORGANIZER') {
		res.send(403);
		return;
	}

	await dbConnect();
	switch (req.method) {
		case 'POST':
			let user = await User.findOne({ application: req.body.id });
			if (user.applicationStatus !== ApplicationStatus.SUBMITTED) {
				return res.status(403).send('');
			}

			if (![ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED].includes(req.body.applicationStatus)) {
				return res.status(405).send('');
			}

			await User.updateOne({ application: req.body.id }, { applicationStatus: req.body.applicationStatus });
			if (req.body.applicationStatus === ApplicationStatus.ACCEPTED) {
				await sendEmail(accepted(user));
			} else if (req.body.applicationStatus === ApplicationStatus.REJECTED) {
				await sendEmail(rejected(user));
			}

			return res.status(200).send('');
		default:
			return res.status(405).send('Method not supported brother');
	}
}
