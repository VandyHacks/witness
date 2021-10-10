import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import Schedule from '../../models/schedule';
import User from '../../models/user';
import Team from '../../models/team';

import { OrganizerScheduleDisplay, ScheduleDisplay } from '../../types/client';
import { ScheduleData } from '../../types/database';
const { ObjectID } = require('mongodb');
import log from '../../middleware/log';

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

async function getHackerSchedule(userID: string): Promise<any | string> {
	const team = await Team.findOne({ members: userID }).populate('members');
	if (!team) return 'no team';
	const schedule = await Schedule.findOne({ team: team.id }).populate('judges');
	return [{
		teamName: team.name,
		time: schedule.time,
		memberNames: team.members.map((x: any) => x.name),
		judgeNames: schedule.judges.map((x: any) => x.name),
		devpost: team.devpost,
		zoom: schedule.zoom
	}];
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

interface AssignmentFromCSV {
	time: Date;
	zoom: string;
	teamName: string;
	judgeNames: string[];
}

// TODO: allow between 1 and 3 judges
async function validateSchedule(schedule: string): Promise<string | AssignmentFromCSV[]> {
	let intermediate = schedule.split('\n').map(asString => asString.replace('\r', '').split(','));
	// Check that the CSV is good.
	const heading = ['Time', 'Zoom', 'Judge1', 'Judge2', 'Judge3', 'TeamName'];
	if (!intermediate.every(row => row.length === 6) || !intermediate[0].every((el, index) => el === heading[index])) {
		return 'Invalid CSV format. Make sure your headings are Time, Zoom, Judge1, Judge2, Judge3, TeamName';
	}
	// Check that urls are valid and also make the actual object list
	// TODO: MAKE THIS NOT HARDCODED
	const validRooms = new Set(
		Array(5)
			.fill(null)
			.map((_, i) => `vhl.ink/room-${i + 1}`)
	);
	let processed: AssignmentFromCSV[] | never = [];
	intermediate.splice(1).forEach((asArray, i) => {
		if (validRooms.has(asArray[1])) {
			processed.push({
				time: new Date(asArray[0]),
				zoom: asArray[1],
				teamName: asArray[5],
				judgeNames: asArray.slice(2, 5),
			});
		} else {
			// TODO: should we make sure the rooms are the same?
			return `Zoom url ${asArray[1]} is not one of our rooms (row ${i + 2}).`;
		}
	});

	// Check that schedule is sorted and at equal minute intervals.
	let lastTime = processed[0].time;
	let message = '';
	let interval = -1;
	processed.find((assignment, index) => {
		if (assignment.time < lastTime) {
			lastTime = assignment.time;
			message = `Schedule is not sorted. See line ${index + 2}.`;
			return true;
		} else if (assignment.time.getMilliseconds() !== lastTime.getMilliseconds()) {
			// Checks for the first increment. All following increments must be the same.
			if (interval === -1) {
				interval = assignment.time.getMilliseconds() - lastTime.getMilliseconds();
			} else {
				message = `Schedule does not advance in equal increments. See line ${index}.`;
				return true;
			}
		}
		return false;
	});
	if (message.length > 0) return message;

	// Check that objects actually exist. Relies on teamnames and judges being unique :/
	// minor TODO: use judge emails instead of names.
	const allJudges = new Set((await User.find({ userType: 'JUDGE' })).map((judge: any) => judge.name));
	const allTeams = new Set((await Team.find({})).flatMap((team: any) => team.name));
	for (const [i, assignment] of processed.entries()) {
		for (const [j, name] of assignment.judgeNames.entries()) {
			if (!allJudges.has(name)) {
				return `Judge "${name}" does not exist (row ${i + 2} judge ${j + 1}).`;
			}
		}
		if (!allTeams.has(assignment.teamName)) {
			return `Team "${assignment.teamName}" does not exist (row ${i + 2}).`;
		}
	}
	// Check that each team only exists once.
	const teams = new Set();
	for (const [i, assignment] of processed.entries()) {
		if (teams.has(assignment.teamName)) {
			return `Team "${assignment.teamName}" is a duplicate (row ${i + 1})`;
		} else {
			teams.add(assignment.teamName);
		}
	}

	// Check that zoom rooms and judges aren't double booked
	let roomsAndJudges = new Set();
	let curTime = new Date(0);
	for (const [i, assignment] of processed.entries()) {
		if (assignment.time !== curTime) {
			curTime = assignment.time;
			roomsAndJudges = new Set();
		} else {
			if (roomsAndJudges.has(assignment.zoom)) {
				return `Zoom room "${assignment.zoom}" appears twice in the same timeslot (row ${i + 1}).`;
			} else {
				roomsAndJudges.add(assignment.zoom);
			}
			assignment.judgeNames.forEach((name, j) => {
				if (roomsAndJudges.has(name)) {
					return `Judge "${name}" appears multiple times in the same timeslot (row ${i + 1} judge ${j + 1}).`;
				} else {
					roomsAndJudges.add(name);
				}
			});
		}
	}

	return processed;
}

async function updateSchedule(schedule: AssignmentFromCSV[]) {
	// TODO: save copy
	await Schedule.remove({});
	const newSchedule: ScheduleData[] = [];
	await Promise.all(
		schedule.map(async assignment => {
			const team = (await Team.findOne({ name: assignment.teamName }))?._id.toString();
			const judges = await Promise.all(
				assignment.judgeNames.map(async name => (await User.findOne({ name }))?._id.toString())
			);
			newSchedule.push({ _id: new ObjectID(), team, judges, zoom: assignment.zoom, time: assignment.time });
		})
	);
	await Schedule.insertMany(newSchedule);
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
		if (!schedule) return res.status(425).send('No assignments found for given user.');
		return res.status(200).json(schedule);
	} else if (req.method === 'PUT' || req.method === 'POST') {
		const validateResults = await validateSchedule(req.body);
		if (typeof validateResults === 'string') return res.status(406).send(validateResults);
		try {
			await updateSchedule(validateResults);
			await log(userID, 'Updated schedule');
			return res.status(200).send('Thanks');
		} catch (e) {
			console.log(e);
			return res.status(404).send('Validation worked but schedule update failed.');
		}
	}
	return res.status(405).send('Method not supported brother');
}
