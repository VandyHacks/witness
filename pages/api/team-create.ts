import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Team from '../../models/team';
import User from '../../models/user';
import { customAlphabet } from 'nanoid';
import log from '../../middleware/log';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 7);

/**
 * Endpoint to create a team
 * @param req
 * @param res
 * @returns the created team
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'HACKER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'POST':
			// get the user's document
			const user = await User.findOne({ email: session.user?.email });

			// check if user exists
			if (!user) return res.status(404).send('User not found');

			// check if the user is already in a team
			if (user.team) return res.status(400).send('You are already in a team');

			// get the teamname from the request body
			const { teamName: tempTeam } = req.body;
			if (!tempTeam) return res.status(400).send('Team name is required');
			const teamName = tempTeam.trim();

			// check if the team name is already taken
			const teamNameTaken = await Team.exists({ name: teamName });
			if (teamNameTaken) return res.status(400).send('Team name is already taken');

			// create the team
			const team = await Team.create({ name: teamName, members: [user._id], joinCode: nanoid() });

			// add the team to the hacker's document
			user.team = team._id;
			await user.save();

			// log the action
			await log(user._id, `Created team ${teamName} (join code ${team.joinCode})`);

			return res.status(200).send(team);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
