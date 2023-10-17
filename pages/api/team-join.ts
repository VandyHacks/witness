import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Team from '../../models/team';
import User from '../../models/user';
import log from '../../middleware/log';

/**
 * Endpoint to join a team with a join code
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
			// get user document
			const user = await User.findOne({ email: session.user?.email });

			// check if the user exists
			if (!user) return res.status(404).send('User not found');

			// if the hacker is in a team, return an error
			if (user.team) return res.status(400).send('Hacker is already in a team. Leave to join another one');

			// get the joincode from the request body
			const { joinCode } = req.body;

			// check if the joincode is valid
			if (!joinCode) return res.status(400).send('Join code is required');

			// get the team with the joincode
			const team = await Team.findOne({ joinCode: { $eq: joinCode } });

			// check if the team exists
			if (!team) return res.status(404).send('Team not found or join code is invalid');

			// add the hacker to the team
			team.members.push(user._id);

			// update hacker's team
			user.team = team._id;

			// save
			await team.save();
			await user.save();

			// log the action
			await log(user._id, `Created team ${team.name} (join code ${team.joinCode})`);

			return res.status(200).send(team);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
