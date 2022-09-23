import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Event from '../../models/event';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'GET':
			const data = await Event.find();
            return res.status(200).send(JSON.stringify(data));
		default:
			return res.status(405).send('Method not supported brother');
	}
}
