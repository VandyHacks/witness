import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

export interface TeamsData {
	teamID: string;
	projectName: string;
	isMine: boolean;
	judgingReceived: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<TeamsData[] | string>): Promise<void> {
	const session = await getSession({ req });
	if (!session) return res.status(401).send('Unauthorized');
	if (req.method === 'GET') {
		// TODO: these are just fillers. Actually implement this route.
		return res.status(200).json([
			// TODO: figure out how to deal with team IDs smartly.
			{
				teamID: '0',
				projectName: 'Witness',
				isMine: true,
				judgingReceived: true,
			},
			{
				teamID: '1',
				projectName: 'Vaken',
				isMine: false,
				judgingReceived: true,
			},
			{
				teamID: '2',
				projectName: 'Waken',
				isMine: false,
				judgingReceived: true,
			},
			{
				teamID: '3',
				projectName: 'This will throw error',
				isMine: true,
				judgingReceived: false,
			},
		]);
	} else if (req.method === 'POST') {
		return res.status(200).send('Thanks');
	}
	return res.status(405).send('Method not supported brother');
}
