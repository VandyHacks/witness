import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Application from '../../models/application';
import sendEmail from './email/email';
import judgingNotice from './email/templates/judgingNotice';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	switch (req.method) {

		case 'POST':
			try {
				await sendEmail(judgingNotice(req.body.hacker));

				return res.status(200).send('');
			} catch (error) {
				console.log(error);
			}
		default:
			return res.status(405).send('Method not supported brother');
	}
}
