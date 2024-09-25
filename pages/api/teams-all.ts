import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { TeamData } from '../../types/database';
import Team from '../../models/team';

/**
 * gets all team information to judges
 * @param req request
 * @param res response
 * @returns response containing relevant team information
 */
export default async function handler(
	req: NextApiRequest,
	// TeamData[] for data, string for error
	res: NextApiResponse<TeamData[] | string>
): Promise<void> {
	const session = await getSession({ req });
	if (session?.userType !== 'JUDGE') return res.status(403).send('Forbidden');

	if (req.method === 'GET') {
		let teams = await Team.find();
		if (req.query.submitted) {
			teams = teams.filter(team => team.devpost !== '' && team.devpost !== undefined);
		}
		return res.status(200).send(teams);
	}
	return res.status(405).send('Method not supported brother');
}
