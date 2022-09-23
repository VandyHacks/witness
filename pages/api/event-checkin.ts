import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import log from '../../middleware/log';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'POST':
			const { nfcId, eventId } = req.body;
			if (!nfcId || !eventId) return res.status(400).send('An nfc id and event id is needed.');

			await User.findOneAndUpdate({ nfcId }, { $push: { eventsAttended: eventId } });
			res.status(200).send(`Checked in ${nfcId} for event ${eventId}`);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
