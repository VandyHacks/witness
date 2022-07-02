import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import PreAdd from '../../models/preadd';
import { PreAddFormFields } from '../../components/preAddForm';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();

	switch (req.method) {
		case 'GET':
			return res.send(await PreAdd.find());
		case 'POST': {
			const { formData } = req.body;
			console.log(formData);
			// todo: handle empty array
			await PreAdd.insertMany(
				// add submitter to every field
				formData!.users.map((data: PreAddFormFields) => ({ ...data, addedBy: session!.user!.name }))
			);
			return res.send(`Stored preadd info for ${formData.length} users.`);
		}
		default:
			return res.status(405).send('Method not supported brother');
	}
}
