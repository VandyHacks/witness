import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Application from '../../models/application';
import UserTestEmail, { USER_TYPES }  from '../../models/usertest';
import sendEmail from './email/email';
import judgingNotice from './email/templates/judgingNotice';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	switch (req.method) {
		case 'GET':
			const session = await getSession({ req });
			if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');
			// TODO: add uniqueness validation try catch
			await dbConnect();
			const userType = req.query.usertype as string;
			// validate usertype
			if (!userType || !USER_TYPES.includes(userType)) return res.status(400).send('Invalid user type');

			// Construct query and await at the end
			let userstest = UserTestEmail.find({ userType });
			if (userType == 'HACKER') {
				Application; // Don't remove or the import will get optimized out and the populate will fail
				userstest = userstest.populate('application');
			}

			return res.status(200).send(await userstest);

		case 'POST':
			try {
				// await sendEmail(judgingNotice(req.body.hacker));

				return res.status(200).send('');
			} catch (error) {
				console.log(error);
			}
		default:
			return res.status(405).send('Method not supported brother');
	}
}
