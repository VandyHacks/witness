import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import Schedule from '../../models/schedule';
import User from '../../models/user';
import Team from '../../models/team';

import { OrganizerScheduleDisplay, ScheduleDisplay } from '../../types/client';
import { ScheduleData } from '../../types/database';

async function getJudgeSchedule(userID: string): Promise<ScheduleDisplay[]> {
	const schedule = await Schedule.find({ judges: userID })
		.sort('time')
		.populate({ path: 'team', populate: { path: 'members', model: User } })
		.populate('judges')
		.lean();
	if (schedule) {
		return schedule.map(assignment => {
			return {
				time: assignment.time,
				teamName: assignment.team.name,
				teamId: assignment.team._id.toString(),
				memberNames: assignment.team.members.map((member: any) => member.name),
				judgeNames: assignment.judges.map((judge: any) => judge.name),
				devpost: assignment.team.devpost,
				zoom: assignment.zoom,
			};
		});
	} else {
		return schedule;
	}
}

async function getHackerSchedule(userID: string): Promise<ScheduleDisplay[] | string> {
	const team = await Team.findOne({ 'members.id': userID });
	if (!team) return 'no team';
	const schedule = await Schedule.findOne({ team: team.id });
	return schedule;
}

async function getOrganizerSchedule(): Promise<OrganizerScheduleDisplay[]> {
	const schedule = await Schedule.find()
		.sort('time')
		.populate({ path: 'team', populate: { path: 'members', model: User } })
		.populate('judges')
		.lean();
	if (schedule) {
		return schedule.map(assignment => {
			return {
				time: assignment.time,
				teamName: assignment.team.name,
				teamId: assignment.team._id.toString(),
				memberNames: assignment.team.members.map((member: any) => member.name),
				judges: assignment.judges.map((judge: any) => ({ name: judge.name, id: judge._id.toString() })),
				devpost: assignment.team.devpost,
				zoom: assignment.zoom,
			};
		});
	} else {
		return schedule;
	}
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ScheduleDisplay[] | OrganizerScheduleDisplay[] | string>
) {
	const session = await getSession({ req });
	if (!session) return res.status(403).send('Forbidden');
	else if (!session.userType) return res.status(418).send('No user type');
	const userID = session.userID as string;
	await import('../../models/team');
	if (req.method === 'GET') {
		console.log('user type:', session.userType);
		let schedule;
		switch (session.userType) {
			case 'JUDGE':
				schedule = await getJudgeSchedule(userID);
				break;
			case 'HACKER':
				schedule = await getHackerSchedule(userID);
				if (schedule === 'no team') return res.status(409).send('hacker needs to be in a team');
				break;
			case 'ORGANIZER':
				schedule = await getOrganizerSchedule();
		}
		if (!schedule) return res.status(404).send('No assignments found for given user.');
		return res.status(200).json(schedule);
	} else if (req.method === 'PUT') {
		return res.status(200).send('Thanks');
	}
	return res.status(405).send('Method not supported brother');
}
