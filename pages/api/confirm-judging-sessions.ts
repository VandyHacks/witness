import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import User from '../../models/user';
import Team from '../../models/team';
import { JudgingSessionData, TeamData } from '../../types/database';
import JudgingSession from '../../models/JudgingSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'POST':
			const { newJudgingSessions }: { newJudgingSessions: JudgingSessionData[] } = req.body;
			if (!newJudgingSessions || newJudgingSessions.length === 0)
				return res.status(400).send('Please send a new array of judging sessions');

			const teamsByID = new Map<string, TeamData>();
			newJudgingSessions.forEach(judgingSession => {
				teamsByID.set(judgingSession.team._id.toString(), judgingSession.team);
			});
			const allTeams = [...teamsByID.values()];
			allTeams.sort(team => new Date(team.createdAt).getTime());

			const promises: any[] = [];
			[...allTeams.entries()].forEach(async ([i, team]) => {
				const teamObj = await Team.findById(team._id);
				teamObj.locationNum = i + 1;
				promises.push(teamObj.save());
			});

			await Promise.all(promises);
			await JudgingSession.deleteMany();
			await JudgingSession.insertMany(newJudgingSessions);

			return res.status(200).send(`Checked in new Judging Sessons into judgingSessions collection`);
		default:
			return res.status(405).send('Method not supported brother');
	}
}
