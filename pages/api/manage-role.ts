import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import log from '../../middleware/log';

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
		case 'PATCH':
			const { formData: userData } = req.body;
			if (!Object.keys(userData).length) return res.status(400).send('A user needs to be selected.');

			const roles = {
				HACKER: [] as (string | never)[],
				JUDGE: [] as (string | never)[],
				ORGANIZER: [] as (string | never)[],
			};
			type rolesIndex = 'HACKER' | 'JUDGE' | 'ORGANIZER';

			// populate roles using data
			for (const user in userData) {
				console.log(user, userData[user]);
				roles[userData[user] as rolesIndex].push(user);
			}

			// set their type to the one provided
			for (const role in roles) {
				await User.updateMany(
					{ _id: { $in: roles[role as rolesIndex] }, userType: { $exists: false } },
					{ userType: role }
				);
			}

			await log(session.userID, `Updated ${userData.length} user roles`);
			return res.status(200).send(`Assigned roles to ${userData.length} users`);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
