import { ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../middleware/database';
import Event from '../../models/event';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'GET':
			// MongoDB aggregate pipeline
			// First lookup all users
			// Then match all users whose checkIns exist
			// Then project to get event IDs with count of checkins
			const count = await Event.aggregate([
				{
					$lookup: {
						from: 'users',
						localField: '_id',
						foreignField: 'eventsAttended',
						as: 'checkIns',
					},
				},
				{
					$match: {
						'checkIns.0': {
							$exists: true,
						},
					},
				},
				{
					$project: {
						count: {
							$size: '$checkIns',
						},
					},
				},
			]);
			return res.status(200).send(JSON.stringify(count));
		default:
			return res.status(405).send('Method not supported brother');
	}
}
