import type { NextApiRequest, NextApiResponse } from 'next';
import Scores from '../../models/scores';
// import Team from '../../models/team';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/client';
import { TeamProfile } from '../team';

const mockTeam = {
	name: 'The Johnny Ives',
	joinCode: 'A8GB89',
	devpost: new URL('https://example.com/devpost'),
	members: ['Mary Pickford', 'Jonathan Groff', 'Hamilton Meyers', 'Sam Tree'],
};
export default async function handler(req: NextApiRequest, res: NextApiResponse<TeamProfile | string>) {
	if (req.method === 'GET') {
		const session = await getSession({ req });
		if (session?.userType !== 'HACKER') return res.status(403).send('Forbidden');
		// Get the hacker's team if it exists. Otherwise yeet them to the team creation/join page.

		// return res.status(409).send('Team not set');
		return res.status(200).json(mockTeam);
	}
	return res.status(405).send('Method not supported brother');
}
