import type { NextApiRequest, NextApiResponse } from 'next';

export interface TeamsData {
	teamID: string;
	projectName: string;
	isMine: boolean;
	judgingReceived: boolean;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<TeamsData[] | null>): void {
	if (req.method === 'GET') {
		// TODO: these are just fillers. Actually implement this route.
		res.status(200).json([
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
		res.status(200).send(null);
	}
}
