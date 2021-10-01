import type { NextApiRequest, NextApiResponse } from 'next';

export type TeamsList = {
	teams: {
		teamName: string;
		isMine: boolean;
		judgingReceived: boolean;
	}[];
};

export default function handler(req: NextApiRequest, res: NextApiResponse<TeamsList | null>): void {
	if (req.method === 'GET') {
		// TODO: these are just fillers. Actually implement this route.
		res.status(200).json({
			teams: [
				{
					teamName: 'Witness',
					isMine: true,
					judgingReceived: true,
				},
				{
					teamName: 'Vaken',
					isMine: false,
					judgingReceived: false,
				},
				{
					teamName: 'Waken',
					isMine: false,
					judgingReceived: true,
				},
				{
					teamName: 'Booty',
					isMine: true,
					judgingReceived: false,
				},
			],
		});
	} else if (req.method === 'POST') {
		res.status(200).send(null);
	}
}
