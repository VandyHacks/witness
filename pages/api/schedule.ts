import type { NextApiRequest, NextApiResponse } from 'next';
import { TeamsData } from './team-select';

// TODO: get rid of this or move to a test file
import faker from 'faker';

let judgeID = 0;
const mockJudges = Array(17)
	.fill(null)
	.map(_ => ({
		id: (judgeID++).toString(),
		name: faker.name.findName(),
	}));

let teamID = 100;
let hackerID = 1000;
const mockTeams = Array(197)
	.fill(null)
	.map(_ => ({
		id: teamID.toString(),
		projectName: faker.commerce.productName(),
		members: Array(1 + Math.floor(Math.random() * 4))
			.fill(null)
			.map(_ => ({ id: (hackerID++).toString(), name: faker.name.findName() })),
		devpostURL: `https://example.com/${teamID++}`,
	}));

const mockZoomRooms = [
	'https://example.com/1',
	'https://example.com/2',
	'https://example.com/3',
	'https://example.com/4',
	'https://example.com/5',
];

// export type scheduleRow = {
// 	room: number;
// 	judges: Person[];
// 	projectName: string;
// 	teamMembers: Person[];
// 	devpostURL: string;
// }[];

export interface Person {
	id: string;
	name: string;
}

export type ScheduleData = {
	startTime: number;
	projectName: string;
	members: Person[];
	judges: Person[];
	devpostURL: string;
	zoomURL: string;
};

const mockSchedule: ScheduleData[] = [];
let timestamp = 1633186800000;
while (mockTeams.length > 0) {
	const teamsInThisTimeSlot = Math.floor(1 + Math.random() * 5);
	const judges = [...mockJudges];
	for (let i = 0; i < teamsInThisTimeSlot; i++) {
		const team = mockTeams.pop();
		if (team) {
			mockSchedule.push({
				startTime: timestamp,
				projectName: team.projectName,
				members: team.members,
				// Yes it's ugly. Just picks a random set of 3 judges from the pool
				judges: Array(3)
					.fill(null)
					.map(_ => judges.splice(Math.floor(Math.random() * judges.length), 1)[0]),
				devpostURL: team.devpostURL,
				zoomURL: mockZoomRooms[i],
			});
		}
	}
	timestamp += 600000;
}

export default function handler(req: NextApiRequest, res: NextApiResponse<ScheduleData[] | null>): void {
	if (req.method === 'GET') {
		// TODO: these are just fillers. Actually implement this route.
		res.status(200).json(mockSchedule);
	} else if (req.method === 'POST') {
		res.status(200).send(null);
	}
}
