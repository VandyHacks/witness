import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../middleware/database';
import User from '../../models/user';
import Team from '../../models/team';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'HACKER' && session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	Team; // Don't remove or the import will get optimized out and the populate will fail
	await dbConnect();
	switch (req.method) {
		case 'GET':
			const limit = parseInt(req.query.limit as string) || 10;

			const users = await User.find({ nfcPoints: { $exists: true } })
				.sort({ nfcPoints: -1 })
				.limit(limit)
				.populate('team')
				.select('name nfcPoints team');

			const returnUser = users.map(user => {
				return {
					name: user.name,
					nfcPoints: user.nfcPoints,
					team: {
						name: user.team?.name,
					},
				};
			});

			return res.status(200).send(returnUser);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
