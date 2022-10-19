import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import { ApplicationStatus } from '../../types/database';
import sendEmail from './email/email';
import reminderToSubmit from './email/templates/reminderToSubmit';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });

	if (session?.userType !== 'ORGANIZER') {
		res.send(403);
		return;
	}

	await dbConnect();
	switch (req.method) {
		case 'GET':
			const logins = await User.find({ applicationStatus: ApplicationStatus.CREATED }).select(
				'id name email userType applicationStatus'
			);
			// read usertype from vaken db
			return res.status(200).send(logins);
		case 'POST':
			const users = await User.find({ applicationStatus: ApplicationStatus.CREATED }).select(
				'id name email userType applicationStatus'
			);

			for (const user in users) {
				//console.log(users[user]['email']) //The user to send an email to.
				let userToEmail = await User.findById(users[user]['id']);
				const template = reminderToSubmit(userToEmail);
				sendEmail(template);
			}

			return res.status(200).send('');
		default:
			return res.status(405).send('Method not supported brother');
	}
}
