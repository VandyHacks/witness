import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Score from '../../models/scores';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');
	// TODO: add uniqueness validation try catch
	await dbConnect();
	switch (req.method) {
		case 'GET':
			const users = await Score.find();
			return res.status(200).send(users);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
