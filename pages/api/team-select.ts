import type { NextApiRequest, NextApiResponse } from 'next';

export type TeamsData = {
	teamID: number;
	teamName: string;
	isMine: boolean;
	judgingReceived: boolean;
}[];

export default function handler(req: NextApiRequest, res: NextApiResponse<TeamsData | null>): void {
	if (req.method === 'GET') {
		// TODO: these are just fillers. Actually implement this route.
		res.status(200).json([
			// TODO: figure out how to deal with team IDs smartly.
			{
				teamID: 0,
				teamName: 'Witness',
				isMine: true,
				judgingReceived: true,
			},
			{
				teamID: 1,
				teamName: 'Vaken',
				isMine: false,
				judgingReceived: false,
			},
			{
				teamID: 2,
				teamName: 'Waken',
				isMine: false,
				judgingReceived: true,
			},
			{
				teamID: 3,
				teamName: 'Booty',
				isMine: true,
				judgingReceived: false,
			},
		]);
	} else if (req.method === 'POST') {
		res.status(200).send(null);
	}
}
