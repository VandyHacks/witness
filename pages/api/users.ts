import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User, { USER_TYPES } from '../../models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');
	// TODO: add uniqueness validation try catch
	await dbConnect();
	switch (req.method) {
		case 'GET':
			const userType = req.query.usertype as string;
			// validate usertype
			if (!userType || !USER_TYPES.includes(userType)) return res.status(400).send('Invalid user type');

			let users = User.find({ userType });
			if (userType == 'HACKER') {
				users = users.populate('application');
			}

			return res.status(200).send(await users);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
