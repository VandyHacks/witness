import { input, select } from '@inquirer/prompts';
import dbConnect from '../../middleware/database';
import User from '../../models/user';
import Team from '../../models/team';
import { promptAction } from '../dev-cli';
import { UserData, TeamData } from '../../types/database';

export const handleGetTeam = async () => {
	const teamName = await input({
		message: 'Enter team name',
	});

	const team: TeamData | null = JSON.parse(JSON.stringify(await Team.findOne({ name: teamName })));
	if (!team) {
		console.log('team not found');
		return promptAction();
	}

	const subAction1 = await select({
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

	switch (subAction1) {
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
		const member: UserData = JSON.parse(JSON.stringify(await User.findOne({ _id: memberId })));
		console.log(`Member ${count++}:`);
		console.log(`Name: ${member.name}`);
		console.log(`Email: ${member.email}`);
	}

	console.log('');
	return promptAction();
};

const getDocument = async (team: TeamData) => {
	console.log('Team Document:');
	console.log(team);

	console.log('');
	return promptAction();
};
