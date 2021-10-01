import type { NextApiRequest, NextApiResponse } from 'next';

export type TeamsList = {
	[teamID: string]: {
		teamName: string;
		isMine: boolean;
		judgingReceived: boolean;
	};
};

export default function handler(req: NextApiRequest, res: NextApiResponse<TeamsList | null>): void {
	if (req.method === 'GET') {
		// TODO: these are just fillers. Actually implement this route.
		res.status(200).json({
			// TODO: figure out how to deal with team IDs.
			'0': {
				teamName: 'Witness',
				isMine: true,
				judgingReceived: true,
			},
			'1': {
				teamName: 'Vaken',
				isMine: false,
				judgingReceived: false,
			},
			'2': {
				teamName: 'Waken',
				isMine: false,
				judgingReceived: true,
			},
			'3': {
				teamName: 'Booty',
				isMine: true,
				judgingReceived: false,
			},
		});
	} else if (req.method === 'POST') {
		res.status(200).send(null);
	}
}
