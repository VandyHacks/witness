import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import dbConnect from '../../middleware/database';
import Event from '../../models/event';
import { EventData } from '../../types/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();

	switch (req.method) {
		case 'POST':
			const events: EventData[] = req.body as EventData[];

			// Create an array of update operations
			const updateOperations = events.map(event => ({
				updateOne: {
					filter: { _id: event._id },
					update: { nfcPoints: event.nfcPoints },
				},
			}));

			// Use Mongoose's updateMany to perform batch updates
			await Event.bulkWrite(updateOperations);

			return res.status(201).json({ message: 'Event Saved' });
		default:
			return res.status(405).send('Method not supported brother');
	}
}
