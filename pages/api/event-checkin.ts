import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';

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
				const alreadyCheckedIn = await User.findOne({ nfcId, eventsAttended: eventId });
				if (alreadyCheckedIn) return res.status(451).send('User already checked in');

				const filter = { nfcId };
				const update = {
					$inc: { nfcPoints: nfcPoints }, // Increment nfcPoints
					$addToSet: { eventsAttended: eventId }, // Add new event to set
				};
				const options = { new: true }; // Return the updated document
				const user = await User.findOneAndUpdate(filter, update, options);
				return res.status(200).send(`Checked in ${nfcId} for event ${eventId}`);
			} catch (error) {
				console.log(error);
				return res.status(500).json({ error: 'An error occurred while updating the user' });
			}

		default:
			return res.status(405).send('Method not supported brother');
	}
}
