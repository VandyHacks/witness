import { input, select } from '@inquirer/prompts';
import dbConnect from '../middleware/database';
import * as dotenv from 'dotenv';
import application from '../models/application';
import { handleModifyHacker } from './cli-util/modify-hacker';
import { handleGetHacker } from './cli-util/get-hacker';
dotenv.config();

/**
 * NOTE: To use this CLI tool, run `ts-node scripts/dev-cli.ts` in your terminal.
 */
const executeCLI = async () => {
	// Select database
	const db = await select({
		message: 'Select database to perform action on',
		choices: [
			{
				name: 'Development Database',
				value: 'dev-db',
			},
		],
	});

	// connect to db
	await dbConnect(process.env.DATABASE_URL);

	// prompt action
	await promptAction();

	// exit
	process.exit(0);
};

export const promptAction = async () => {
	// TODO:
	// list actions we as devs will need to do and can be simplified with this CLI tool
	// [ ] populate collections with dummy data
	// [ ] clear collection (danger)
	// [G] get a document from a colleciton (i.e., hacker document using email)
	// 			[ ] hacker document using email
	// 			[ ] team document using team or hacker email or team invite code
	// [Z] automatically allow a hacker to check in to an event (via nfc)

	// Select action
	const action = await select({
		message: 'Select action to perform',
		choices: [
			{
				name: "Get a hacker's document",
				value: 'get-hacker',
				// sub-action:
				// 1. see their events
				// 2. see their team info
				// 3. see their application
				// 4. get entire JSON of their document
			},
			{
				name: 'Get a team document',
				value: 'get-team',
				// sub-action:
				// 1. see their schedule
				// 2. see their members
				// 3. get entire JSON of their document
			},
			{
				name: "Modify a hacker's document",
				value: 'modify-hacker',
				// sub-action:
				// 1. change application status
				// 2. delete application
				// 3. join/leave team
				// 4. check in
			},
			{
				name: 'Modify a team',
				value: 'modify-team',
				// sub-action:
				// 1. change team name
				// 2. change team members?
				// 3. change team invite code?
				// 4. change devpost link?
			},
			{
				name: 'Clear a collection (dangerous)',
				value: 'clear-collection',
			},
			{
				name: 'Populate a collection',
				value: 'populate-collection',
			},
		],
	});

	// Perform action
	switch (action) {
		case 'get-hacker':
			await handleGetHacker();
			break;
		case 'modify-hacker':
			await handleModifyHacker();
			break;
		default:
			console.log('Invalid action');
	}
};

// handle api error(a function that's called when API calls return 404)
const handleError = () => {
	console.log('Error: You need to have the witness running');
};

// Execute the CLI tool
executeCLI();
