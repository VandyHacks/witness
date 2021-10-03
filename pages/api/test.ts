import dbConnect from '../../middleware/database';
import Hacker from '../../models/hacker';
import Team from '../../models/team';
import type { NextApiRequest, NextApiResponse } from 'next';

interface Data {
	success: string;
	data: JSON;
	team: JSON;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	const { method } = req;
	await dbConnect();

	const hacker = await Hacker.find({ firstName: 'Felix' });
	console.log(hacker);

	const team = {
		name: 'test team ez',
		devpost: 'https://devpost.com',
		joinCode: 'ABCSECRET',
		members: [hacker],
	};

	const teamDoc = new Team(team);
	const newTeam = await teamDoc.save();
	console.log(newTeam);

	res.status(200).json({ success: 'true', data: hacker as unknown as JSON, team: newTeam });
}
