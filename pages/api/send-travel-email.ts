import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import log from '../../middleware/log';
import { ApplicationStatus, UserData } from '../../types/database';
import { sendTravelEmail } from './emails/aws';
import { UserSchema } from '../../models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	//const session = await getSession({ req });
	//if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');
	// TODO: add uniqueness validation try catch
	await dbConnect();
	switch (req.method) {
		case 'GET':
			const logins = await User.find({}).select('id name email applicationStatus');

			return res.status(200).send(logins);
		case 'POST':
			sendTravelEmail(req.body)
			return res.status(200).send(`Sent travel email to ${req.body.email}`);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
