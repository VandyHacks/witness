import type { NextApiRequest, NextApiResponse } from 'next';
import Scores from '../../models/scores';
// import Team from '../../models/team';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/client';

export type TeamFormData = { teamName: string } | { joinCode: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
	if (req.method === 'POST') {
		// TODO: Handle specifically team creation or joining, i.e. adding the hacker to a team and back ye.
		const session = await getSession({ req });
		if (session?.userType !== 'HACKER') return res.status(403).send('Forbidden');
		// ...
		return res.status(200).send('Nice');
	}
	return res.status(405).send('Method not supported brother');
}
