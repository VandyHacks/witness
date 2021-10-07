import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

// TODO: get rid of this or move to a test file
import faker from 'faker';
import { Team } from '../../types/types';

const mockJudges = Array(17)
	.fill(null)
	.map((_, judgeID) => ({
		id: judgeID.toString(),
		name: faker.name.findName(),
	}));

mockJudges[0].name = 'Saadi Lejpai'; // For testing

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

// export interface Person {
// 	id: string;
// 	name: string;
// }

export type ScheduleData = {
	startTime: number;
	projectName: string;
	members: string[];
	judges: string[];
	devpostURL: string;
	zoomURL: string;
};

const mockSchedule: ScheduleData[] = [];
let timestamp = new Date().getTime() - 3.6e6;
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

// ================================================================================================
const now = 1633570605000;
const myJudge = faker.name.findName();
const data = Array(20)
	.fill(null)
	.map((_, i) => ({
		startTime: now + 5000 * i,
		projectName: `Some Project ${i}`,
		members: ['member1', 'member2', 'member3', 'member4'],
		judges: [myJudge, 'someOtherJudge', 'someOtherJudge'],
		devpostURL: `https://example.com/devpost-${i}`,
		zoomURL: `https://example.com/zoom-${i}`,
	}));
async function getJudgeSchedule(): Promise<ScheduleData[]> {
	return Promise.resolve(data);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ScheduleData[] | string>) {
	const session = await getSession({ req });
	if (!session) return res.status(403).send('Forbidden');
	if (!session.userType) return res.status(418).send('No user type');
	if (req.method === 'GET') {
		console.log('hey user type:', session.userType);
		let data;
		// switch (session.userType) {
		// 	case 'JUDGE':
		// 		data = await getJudgeSchedule();
		// 		break;
		// 	default:
		// 		data = mockSchedule;
		// }
		data = await getJudgeSchedule();
		// Note: schedule data should be sorted by time.
		return res.status(200).json(data);
	} else if (req.method === 'POST') {
		return res.status(200).send('Thanks');
	}
	return res.status(405).send('Method not supported brother');
}
