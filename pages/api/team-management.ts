import type { NextApiRequest, NextApiResponse } from 'next';
import { customAlphabet } from 'nanoid';
import Scores from '../../models/scores';
import Team from '../../models/team';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/client';
import { TeamProfile } from '../team';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 7);

const mockTeam = {
	name: 'The Johnny Ives',
	joinCode: 'A8GB89',
	devpost: new URL('https://example.com/devpost'),
	members: ['Mary Pickford', 'Jonathan Groff', 'Hamilton Meyers', 'Sam Tree'],
};
export default async function handler(req: NextApiRequest, res: NextApiResponse<TeamProfile | string>) {
	const session = await getSession({ req });
	if (session?.userType !== 'HACKER') return res.status(403).send('Forbidden');
	// TODO: add uniqueness validation try catch
	switch (req.method) {
		case 'GET':
			const team = await Team.findOne({ members: { $in: [session.userID] } });
			return res.status(200).send(team);
		case 'POST': {
			const { joinCode, teamName, devpost } = req.body;
			// join team
			if (joinCode) {
				const team = await Team.findOne({ joinCode });
				if (!team) return res.status(404).send('Team not found');

				team.members.push(session.userID);
				await team.save();
				return res.status(201).send(team);
			} else if (teamName) {
				// make team
				const teamObj = {
					name: teamName,
					joinCode: nanoid(),
					devpost,
					members: [session.userID],
				};
				const team = new Team(teamObj);
				await team.save();
				res.status(201).send(team);
			}
			return res.status(400).send('Either joinCode or teamName required.');
		}
		case 'PATCH': {
			const team = await Team.findOne({ members: { $in: [session.userID] } });
			if (!team) return res.status(404).send('Team not found');

			const { teamName, devpost } = req.body;
			if (devpost) team.devpost = devpost;
			if (teamName) team.teamName = teamName;

			await team.save();
			return res.status(200).send(team);
		}

		case 'DELETE': {
			const { userID } = session;
			let team = await Team.findOne({ members: { $in: [userID] } });
			if (!team) return res.status(404).send('Team not found');
			team.members = team.members.filter((id: unknown) => id !== userID);
			await team.save();
			return res.status(200).send(team);
		}
		default:
			return res.status(405).send('Method not supported brother');
	}
}
