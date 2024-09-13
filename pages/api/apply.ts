import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import { ApplicationStatus } from '../../types/database';
import Application from '../../models/application';
import sendEmail from '../../email/email';
import travelForm from '../../email/templates/travelForm';
import submitted from '../../email/templates/submitted';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'HACKER') {
		res.send(403);
		return;
	}

	if (!session || !session.user || !session.user.email) {
		res.send(403);
		return;
	}

	await dbConnect();
	switch (req.method) {
		case 'POST':
			let user = await User.findOne({ email: session.user.email });
			if ('applicationStatus' in user && user.applicationStatus !== ApplicationStatus.CREATED) {
				res.send(403);
				return;
			}

			const body = JSON.parse(req.body);
			const application = await Application.create(body);

			await User.findOneAndUpdate(
				{ email: session.user.email },
				{ application: application._id, applicationStatus: ApplicationStatus.SUBMITTED }
			);

			// await sendEmail(await submitted(user));
			// if (body.applyTravelReimbursement === 'yes') await sendEmail(await travelForm(user));

			return res.send(200);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
