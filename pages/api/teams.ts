import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import Team from '../../models/team';
import { TeamData } from '../../types/database';
import Schedule from '../../models/schedule';
import Scores from '../../models/scores';
import { ObjectId } from 'mongodb';
import { TeamSelectData } from '../../types/client';
import JudgingSession from '../../models/JudgingSession';

export default async function handler(
	req: NextApiRequest,
	// TeamSelectData[] for judges, TeamData[] for organizers, string for error
	res: NextApiResponse<TeamSelectData[] | TeamData[] | string>
): Promise<void> {
	const session = await getSession({ req });
	if (!['JUDGE', 'ORGANIZER'].includes(session?.userType as string)) return res.status(403).send('Forbidden');
	if (req.method === 'GET') {
		const teams = await Team.find();
		switch (session!.userType) {
			case 'ORGANIZER': {
				return res.status(200).send(teams);
			}
			case 'JUDGE': {
				const judgeID = session!.userID as ObjectId;

				const teamsAssigned = await JudgingSession.find({ judge: judgeID }).select('team');
				const teamsAssignedIDs = teamsAssigned.map(team => team.team.toString());

				const teamsJudged = await Scores.find({ judge: judgeID }).select('_id');
				const teamsJudgedIDs = teamsJudged.map(team => team._id.toString());

				const teamsData = teams.map(team => {
					return {
						_id: team._id,
						name: team.name,
						isMine: teamsAssignedIDs.includes(team._id.toString()),
						haveJudged: teamsJudgedIDs.includes(team._id.toString()),
					};
				});

				res.status(200).send(teamsData);
			}
		}
	} else return res.status(405).send('Method not supported brother');
}
