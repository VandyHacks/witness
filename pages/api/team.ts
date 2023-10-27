import type { NextApiRequest, NextApiResponse } from 'next';
import Team from '../../models/team';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import { TeamProfile } from '../../types/client';
import { UserData } from '../../types/database';
import { ObjectId } from 'mongodb';

/**
 * Endpoint to get the current hacker's team
 * @param req
 * @param res
 * @returns the current hacker's team
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<TeamProfile | string>) {
	const session = await getSession({ req });
	if (session?.userType !== 'HACKER') return res.status(403).send('Forbidden');
	// TODO: add uniqueness validation try catch
	await dbConnect();

	// get the hacker
	const user: UserData | null = await User.findOne({ email: session.user?.email });
	if (!user) return res.status(404).send('Hacker not found');

	switch (req.method) {
		// get the current hacker's team
		case 'GET':
			// find team whose hacker id in members array
			const userId = user._id.toString();

			const team = await Team.findOne({
				members: { $in: [new ObjectId(userId)] },
			})
				.populate({ path: 'members', model: User })
				.lean();

			if (!team) return res.status(404).send('Team not found. Hacker is not in a team');

			return res.status(200).send(team);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
