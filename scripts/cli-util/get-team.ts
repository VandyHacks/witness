import { select } from '@inquirer/prompts';
import User from '../../models/user';
import Team from '../../models/team';
import Schedule from '../../models/schedule';
import { promptAction } from '../dev-cli';
import { UserData, TeamData, ScheduleData } from '../../types/database';

export const handleGetTeam = async () => {
	const teams: TeamData[] | null = await Team.find();

	if (!teams) {
		console.log('team not found');
		return promptAction();
	}

	const team = await select({
		message: 'Select team',
		choices: [
			{
				name: '⏪ Back',
				value: null,
			},
			...teams.map((team, index) => ({
				name: `${index + 1}) ${team.name}`,
				value: team,
			})),
		],
	});

	if (!team) {
		return promptAction();
	}

	const subAction2 = await select({
		message: 'Select an action to perform',
		choices: [
			{
				name: 'Get schedule',
				value: 'get-schedule',
			},
			{
				name: 'Get members',
				value: 'get-members',
			},
			{
				name: 'Get document',
				value: 'get-document',
			},
		],
	});

	switch (subAction2) {
		case 'get-schedule':
			await getSchedule(team);
			break;
		case 'get-members':
			await getMembers(team);
			break;
		case 'get-document':
			await getDocument(team);
			break;
		default:
			console.log('Invalid action');
	}
};

const getSchedule = async (team: TeamData) => {
	const schedules: ScheduleData[] | null = await Schedule.find({
		team: team._id,
	});
	schedules.forEach(schedule => {
		console.log('Schedule:');
		console.log(`Table Number: ${team.locationNum}`);
		console.log(`Time: ${schedule.time}`);
		schedule.judges.forEach(async judgeId => {
			const judge: UserData | null = await User.findOne({ _id: judgeId });
			if (!judge) {
				console.log('Judge not found');
			} else {
				console.log(`Judge: ${judge.name}`);
			}
		});
	});
	console.log('');
	return promptAction();
};

const getMembers = async (team: TeamData) => {
	const memberIds = team.members;

	let count = 1;
	for (const memberId of memberIds) {
		const member: UserData | null = await User.findOne({ _id: memberId });
		if (!member) {
			console.log(`Member ${count++}:`);
			console.log('Member not found');
		} else {
			console.log(`Member ${count++}:`);
			console.log(`Name: ${member.name}`);
			console.log(`Email: ${member.email}`);
		}
	}

	return promptAction();
};

const getDocument = async (team: TeamData) => {
	console.log('Team Document:');
	console.log(team);

	console.log('');
	return promptAction();
};
