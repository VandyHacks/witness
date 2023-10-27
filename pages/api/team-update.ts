import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Team from '../../models/team';
import User from '../../models/user';
import log from '../../middleware/log';

/**
 * Endpoint to update a team
 * @param req
 * @param res
 * @returns the created team
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'HACKER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'PATCH':
			// get the user's document
			const user = await User.findOne({ email: session.user?.email });

			// check if user exists
			if (!user) return res.status(404).send('User not found');

			// get the current hacker's team
			const team = await Team.findOne({ members: session.userID });

			// if the hacker is not in a team, return error
			if (!team) return res.status(404).send('Team not found. Hacker is not in a team');

			// get the teamname from the request body
			const { teamName: tempTeam, devpost } = req.body;
			const teamName = tempTeam.trim();

			// update the team name
			if (teamName) {
				// check if the team name is already taken
				const teamNameTaken = await Team.exists({ name: teamName });
				if (teamNameTaken) return res.status(400).send('Team name is already taken');

				// log the action
				await log(user._id, `Changed team name ${team.name} => ${teamName} (join code ${team.joinCode})`);

				// update the team name
				team.name = teamName;
			}

			// update the devpost link
			if (devpost) {
				// check if the devpost link is valid
				if (!(devpost.startsWith('https://devpost.com/') || devpost.startsWith('http://www.devpost.com/')))
					return res
						.status(400)
						.send('Invalid devpost link. Must start with https://devpost.com/ or https://www.devpost.com/');

				// log the action
				await log(user._id, `Changed team devpost ${team.devpost} => ${devpost} (join code ${team.joinCode})`);

				// update the devpost link
				team.devpost = devpost;
			}

			// save the team
			await team.save();

			// return the updated team
			return res.status(200).send(team);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
