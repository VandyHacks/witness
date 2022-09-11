import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Application from '../../models/application';
import { ApplicationData } from '../../types/database';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ApplicationData[] | string>
): Promise<void> {
	const session = await getSession({ req });
	// if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();
	if (req.method === 'GET') {
		const applications = await Application.aggregate([
			{
				$lookup: {
					from: 'users',
					localField: '_id',
					foreignField: 'application',
					as: 'user',
				},
			},
			{
				$unwind: {
					path: '$user',
				},
			},
			{
				$project: {
					_id: 1,
					firstName: 1,
					lastName: 1,
					gender: 1,
					dietaryRestrictions: 1,
					phoneNumber: 1,
					dateOfBirth: 1,
					school: 1,
					major: 1,
					graduationYear: 1,
					race: 1,
					motivation: 1,
					attendingInPerson: 1,
					volunteer: 1,
					address1: 1,
					city: 1,
					state: 1,
					zip: 1,
					shirtSize: 1,
					createdAt: 1,
					updatedAt: 1,
					'user.applicationStatus': 1,
					'user.email': 1,
				},
			},
		]);
		return res.status(200).send(applications);
	} else return res.status(405).send('Method not supported brother');
}
