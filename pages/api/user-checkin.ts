import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import { ApplicationStatus } from '../../types/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'POST':
			const { userId, nfcId } = req.body;
			if (!nfcId || !userId) return res.status(400).send('An NFC id and user id are needed');

			const user = await User.findById(userId);
			if (!user) return res.status(404).send('User not found');

			user.nfcId = nfcId;
			user.applicationStatus = ApplicationStatus.CHECKED_IN;
			user.save();

			return res.status(200).send(`User ${user.name} checked in successfully`);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
