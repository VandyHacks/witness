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

			events.forEach(async event => {
				const { _id, nfcPoints } = event;
				console.log(nfcPoints);
				await Event.findByIdAndUpdate(_id, { nfcPoints });
			});

			return res.status(201).json({ message: 'Event Saved' });
		default:
			return res.status(405).send('Method not supported brother');
	}
}
