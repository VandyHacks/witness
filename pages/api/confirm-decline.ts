import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import { ApplicationStatus } from '../../types/database';
import sendEmail from '../../email/email';
import confirmed from '../../email/templates/confirmed';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	console.log('HERE');
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
			const body = JSON.parse(req.body);
			const { applicationStatus: status } = body;
			const user = await User.findOne({ email: session.user.email });

			if (user.applicationStatus !== ApplicationStatus.ACCEPTED) {
				return res.status(403).send('Haha you tried');
			}

			console.log(req.body);
			if (![ApplicationStatus.CONFIRMED, ApplicationStatus.DECLINED].includes(status)) {
				return res.status(405).send('');
			}

			user.applicationStatus = status;
			await user.save();
			if (status === ApplicationStatus.CONFIRMED) {
				await sendEmail(await confirmed(user));
			}

			return res.status(200).send('');
		default:
			return res.status(405).send('Method not supported brother');
	}
}
