import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import { getSession } from 'next-auth/client';
import Team from '../../models/team';
import User from '../../models/user';
import Schedule from '../../models/schedule';
import Scores from '../../models/scores';

export interface TeamsData {
	teamID: string;
	teamName: string;
	isMine: boolean;
	haveJudged: boolean;
}

export interface Teams {
	_id: mongoose.Schema.Types.ObjectId;
	name: string;
	joinCode: string;
	devpost: string;
	members: typeof User[];
	scores: mongoose.Schema.Types.ObjectId[];
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<TeamsData[] | Teams[] | string>
): Promise<void> {
	const session = await getSession({ req });
	if (!['JUDGE', 'ORGANIZER'].includes(session?.userType as string)) return res.status(403).send('Forbidden');
	if (req.method === 'GET') {
		const teams = await Team.find();
		console.log('teams: ', teams);
		switch (session!.userType) {
			case 'ORGANIZER': {
				return res.status(200).send(teams);
			}
			case 'JUDGE': {
				const judgeID = session!.userID;
				const scores = await Scores.find();
				const scoresMap = new Map();
				// map team ID to array of judges
				// this answers if the team has been judged by the judge or not
				scores.forEach(s => {
					if (scoresMap.has(s.team)) scoresMap.get(s.team).push(s.judge);
					else scoresMap.set(s.team, [s.judge]);
				});

				const schedule = await Schedule.find();
				const scheduleMap = new Map();
				// map teamID to array of judges as well
				// this answers if the team has been assigned to a judge
				schedule.forEach(s => {
					scheduleMap.set(s.team, s.judges);
				});

				const teamsData = teams.map(team => {
					return {
						teamID: team.id,
						teamName: team.name,
						isMine: scheduleMap.get(team.id)?.includes(judgeID),
						haveJudged: scoresMap.get(team.id)?.includes(judgeID),
					};
				});

				res.status(200).send(teamsData);
			}
		}
	} else return res.status(405).send('Method not supported brother');
}
