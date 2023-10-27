import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Team from '../../models/team';
import User from '../../models/user';
import { TeamData } from '../../types/database';
import { ObjectId } from 'mongoose';
import log from '../../middleware/log';

/**
 * Endpoint to leave a team
 * @param req
 * @param res
 * @returns
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'HACKER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'PATCH':
			// get the user's document
			const user = await User.findOne({ email: session.user?.email });

			// check if the user exists
			if (!user) return res.status(404).send('User not found');

			// get the hacker's team
			const team = await Team.findOne({ members: user._id });

			// if the hacker is not in a team, return success anyway
			if (!team || !user.team) return res.status(200).send('Hacker is not in a team');

			// remove the hacker from the team
			team.members = team.members.filter((member: ObjectId) => member.toString() !== user._id.toString());

			// update hacker's team
			user.team = null;

			if (team.members.length === 0) {
				// if the team is empty, delete it
				await Team.findByIdAndDelete(team._id);

				// save the user
				await user.save();

				// log the action
				await log(user._id, `Deleted team ${team.name} (join code ${team.joinCode})`);

				return res.status(200).send('Hacker left the team successfully. Team was deleted');
			} else {
				// otherwise, save the team
				await team.save();

				// save the user
				await user.save();

				// log the action
				await log(user._id, `Left team ${team.name} (join code ${team.joinCode})`);

				return res.status(200).send('Hacker left the team successfully');
			}
		default:
			return res.status(405).send('Method not supported brother');
	}
}
