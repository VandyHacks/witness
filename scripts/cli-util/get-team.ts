import { input, select } from '@inquirer/prompts';
import dbConnect from '../../middleware/database';
import User from '../../models/user';
import Team from '../../models/team';
import { promptAction } from '../dev-cli';
import { UserData, TeamData } from '../../types/database';

export const handleGetTeam = async () => {
	const teams: TeamData[] | null = await Team.find();

	if (!teams) {
		console.log('team not found');
		return promptAction();
	}

	const team = await select({
		message: 'Select team',
		choices: teams.map(team => ({
			name: team.name,
			value: team,
		})),
	});

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

	// connect to db
	await dbConnect();

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
	console.log('IN PROGRESS');
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
