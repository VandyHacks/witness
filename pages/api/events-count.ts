import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../middleware/database';
import user from '../../models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'GET':
			if (req.query.eventId && ObjectId.isValid(req.query.eventId.toString())) {
				const count = await user.find({ eventsAttended: { $eq: req.query.eventId } }).countDocuments();
				return res.status(200).send(JSON.stringify(count));
			} else {
				return res.status(400).send('Bad Request');
			}
		default:
			return res.status(405).send('Method not supported brother');
	}
}
