import { input, select } from '@inquirer/prompts';
import { UserData } from '../../types/database';
import useSWR from 'swr';
import dbConnect from '../../middleware/database';

export const handleGetHacker = async () => {
	const hackerEmail = await input({
		message: 'Enter hacker email',
	});

	const subAction1 = await select({
		message: 'Select an action to perform',
		choices: [
			{
				name: 'Get events',
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

	switch (subAction1) {
		case 'get-events':
			await getEvents();
			break;
		case 'get-team':
			await getTeam();
			break;
		case 'get-application':
			await getApplication();
			break;
		case 'get-document':
			await getDocument();
			break;
		default:
			console.log('Invalid action');
	}
};

const getEvents = async () => {};

const getTeam = async () => {};

const getApplication = async () => {};

const getDocument = async () => {};
