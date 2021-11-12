import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Schedule from '../../models/schedule';
import User from '../../models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse<string>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');
	if (req.method !== 'GET') return res.status(404).send('Invalid method.');

	await dbConnect();

	const schedule = await Schedule.find()
		.sort('time')
		.populate({ path: 'team', populate: { path: 'members', model: User } })
		.populate('judges')
		.lean();

	const fields = ['Time', 'Zoom', 'Judge1', 'Judge2', 'Judge3', 'TeamName'];
	// TODO: no commas allowed in team name
	const rows = schedule.map(item => [
		item.time,
		item.zoom,
		item.judges[0]?.name,
		item.judges[1]?.name,
		item.judges[2]?.name,
		item.team.name,
	]);
	rows.splice(0, 0, fields);

	const csvContent = rows.map(e => e.join(',')).join('\n');
	res.setHeader('Content-Type', 'text/csv');
	return res.status(200).send(csvContent);
}
