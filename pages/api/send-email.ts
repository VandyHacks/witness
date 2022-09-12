import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import log from '../../middleware/log';
import { ApplicationStatus } from '../../types/database';
import { sendStatusEmail } from './emails/aws';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    const session = await getSession({ req });
    if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');
    // TODO: add uniqueness validation try catch
    await dbConnect();
    switch (req.method) {
		case 'GET':
			const logins = await User.find({}).select('id name email userType');
			// read usertype from vaken db
			return res.status(200).send(logins);
		case 'POST':
			const { formData: userData } = req.body;
			if (!Object.keys(userData).length) return res.status(400).send('A user needs to be selected.');

			const statuses = {
				SUBMITTED: [] as (string | never)[],
				ACCEPTED: [] as (string | never)[],
				REJECTED: [] as (string | never)[],
			};
            
			type statusIndex = 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';

			for (const user in userData) {
				console.log(user, userData[user]);
				statuses[userData[user] as statusIndex].push(user);
                await User.updateOne()
			}

			// set their type to the one provided
			for (const status in statuses) {
				await User.updateMany({ _id: { $in: statuses[status as statusIndex] } }, { applicationStatus: status });
                sendStatusEmail(user, status)
			}

			await log(session.userID, `Updated ${Object.keys(userData).length} user roles`);
			return res.status(200).send(`Assigned status to ${userData.length} users`);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
