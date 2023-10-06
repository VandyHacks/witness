import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import Event from '../../models/event';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'POST':
			const { nfcId, eventId, nfcPoints } = req.body;
			console.log('NFC Point: ', nfcPoints);
			if (!nfcId || !eventId) return res.status(400).send('An NFC id and event id are needed');

			try {
				// ensure that user exists
				const user = await User.findOne({ nfcId: { $eq: nfcId } });
				if (!user) return res.status(404).send('User not found');

				// ensure that event exists
				const event = await Event.findOne({ _id: { $eq: eventId } });
				if (!event) return res.status(404).send('Event not found');

				// ensure that user is not already checked in
				const alreadyCheckedIn = user.eventsAttended.includes(eventId);
				if (alreadyCheckedIn) return res.status(451).send('User already checked in to the event');

				// check in the user
				user.nfcPoints += nfcPoints;
				user.eventsAttended.push(eventId);

				// save the user
				const updatedUser = await user.save();

				return res
					.status(200)
					.send(
						`Checked in ${updatedUser?._id} for event ${eventId} and updated their nfcPoints to ${updatedUser?.nfcPoints}`
					);
			} catch (error) {
				console.log(error);
				return res.status(500).json({ error: 'An error occurred while updating the user' });
			}

		default:
			return res.status(405).send('Method not supported brother');
	}
}
