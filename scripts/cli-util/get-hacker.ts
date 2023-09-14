import { input, select } from '@inquirer/prompts';
import dbConnect from '../../middleware/database';
import User from '../../models/user';
import Event from '../../models/event';
import team from '../../models/team';
import { promptAction } from '../dev-cli';
import { UserData, TeamData, EventData } from '../../types/database';

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
				name: 'Get application status',
				value: 'get-application-status',
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
			await getEvents(user);
			break;
		case 'get-team':
			await getTeam(user);
			break;
		case 'get-application-status':
			await getApplicationStatus(user);
			break;
		case 'get-document':
			await getDocument(user);
			break;
		default:
			console.log('Invalid action');
	}
};

const getEvents = async (user: UserData) => {
	const events = user.eventsAttended;
	const size = events.length;

	if (size === 0) console.log('No events attended yet! :(');

	for (const eventId of events) {
		const event: EventData = JSON.parse(JSON.stringify(await Event.findOne({ _id: eventId })));
		console.log(event.name);
	}

	console.log('');
	return promptAction();
};

const getTeam = async (user: UserData) => {
	const teamId = user.team;
	const hackerTeam = JSON.parse(JSON.stringify(await team.findOne({ _id: teamId })));
	console.log('Team Document');
	console.log(hackerTeam);

	console.log('');
	return promptAction();
};

const getApplicationStatus = async (user: UserData) => {
	console.log(`Application status: ${user.applicationStatus}`);

	console.log('');
	return promptAction();
};

const getDocument = async (user: UserData) => {
	console.log('User Document:');
	console.log(user);

	console.log('');
	return promptAction();
};
