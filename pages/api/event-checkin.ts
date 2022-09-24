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
			const { nfcId, eventId } = req.body;
			if (!nfcId || !eventId) return res.status(400).send('An NFC id and event id are needed');

			const result = await User.updateOne(
				{ nfcId: nfcId },
				{ $addToSet: { eventsAttended: eventId } },
			);
			if (result.matchedCount === 0) return res.status(404).send('User not found');
			// The user might have already checked in, but we can't tell
			return res.status(200).send(`Checked in ${nfcId} for event ${eventId}`);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
