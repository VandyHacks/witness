import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import user from '../../models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'PATCH':
			try {
				const { baseTheme, accentColor } = req.body;
				const userObject = await user.findOne({
					email: session?.user?.email,
				});
				if (!userObject) return res.status(400).send('User not found');
				userObject.settings.baseTheme = baseTheme;
				userObject.settings.accentColor = accentColor;

				const newUser = await userObject.save();

				return res.status(200).send(newUser);
			} catch (err) {
				return res.status(500).send("Couldn't update user settings");
			}
		default:
			return res.status(405).send('Method not supported brother');
	}
}
