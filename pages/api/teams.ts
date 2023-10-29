import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { ObjectId } from 'mongodb';
import { TeamData } from '../../types/database';
import { TeamSelectData } from '../../types/client';
import Team from '../../models/team';
import Scores from '../../models/scores';
import JudgingSession from '../../models/JudgingSession';

/**
 * gets relevant team information to judges and organizers
 * @param req request
 * @param res response
 * @returns response containing relevant team information
 */
export default async function handler(
	req: NextApiRequest,
	// TeamSelectData[] for judges, TeamData[] for organizers, string for error
	res: NextApiResponse<TeamSelectData[] | TeamData[] | string>
): Promise<void> {
	// only judges and organizers can access this endpoint
	const session = await getSession({ req });
	if (!['JUDGE', 'ORGANIZER'].includes(session?.userType as string)) return res.status(403).send('Forbidden');

	if (req.method === 'GET') {
		let teams = await Team.find();

		if (req.query.submitted) {
			teams = teams.filter(team => team.devpost !== '' && team.devpost !== undefined);
		}

		switch (session!.userType) {
			// send all team info to organizer
			case 'ORGANIZER': {
				return res.status(200).send(teams);
			}

			// send pertinent team info to judge
			case 'JUDGE': {
				// get the judge
				const judgeID = session!.userID as ObjectId;

				// get the teams assigned to the judge
				const teamsAssigned = await JudgingSession.find({ judge: judgeID }).select('team');
				const teamsAssignedIDs = teamsAssigned.map(team => team.team.toString());

				// get the teams already judged by the judge
				const teamsJudged = await Scores.find({ judge: judgeID }).select('_id');
				const teamsJudgedIDs = teamsJudged.map(team => team._id.toString());

				// object containing info about:
				//   which teams the judge is assigned
				//   which teams the judge has already judged
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
