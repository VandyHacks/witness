import { input, select } from '@inquirer/prompts';
import dbConnect from '../../middleware/database';
import User from '../../models/user';
import team from '../../models/team';
import { promptAction } from '../dev-cli';
import { UserData, TeamData } from '../../types/database';

export const handleGetHacker = async () => {
	const hackerEmail = await input({
		message: 'Enter hacker email',
	});

	const user: UserData | null = JSON.parse(JSON.stringify(await User.findOne({ email: hackerEmail })));
	if (!user) {
		console.log('Hacker not found');
		return promptAction();
	}

	const subAction1 = await select({
		message: 'Select an action to perform',
		choices: [
			{
				name: 'Get events attended',
				value: 'get-events',
			},
			{
				name: 'Get team info',
				value: 'get-team',
			},
			{
				name: 'Get application',
				value: 'get-application',
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
		case 'get-events':
			await getEvents();
			break;
		case 'get-team':
			await getTeam(user);
			break;
		case 'get-application':
			await getApplication();
			break;
		case 'get-document':
			console.log(user);
			break;
		default:
			console.log('Invalid action');
	}
};

const getEvents = async () => {};

const getTeam = async (user: UserData) => {
	const teamId = user.team;
	const hackerTeam = JSON.parse(JSON.stringify(await team.findOne({ _id: teamId })));
	console.log(hackerTeam);

	return promptAction();
};

const getApplication = async () => {};
