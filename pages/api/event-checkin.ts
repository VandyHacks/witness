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
			const { nfcID, eventID } = req.body;
			if (!nfcID || !eventID) return res.status(400).send('An NFC id and event id are needed');

			const userUpdated = await User.findOneAndUpdate(
				{ nfcId: nfcID },
				{ $push: { eventsAttended: eventID } },
				{ returnNewDocument: true }
			);
			if (!userUpdated) return res.status(404).send('User not found');
			return res.status(200).send(`Checked in ${nfcID} for event ${eventID}`);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
