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
			const { nfcId, userId } = req.body;
			if (!nfcId || !userId) return res.status(400).send('An nfc id and user id is needed.');

			await User.findOneAndUpdate({ _id: userId }, { nfcId });
			res.status(200).send(`Checked in ${nfcId} for user ${userId}`);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
