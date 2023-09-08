import { input, select } from '@inquirer/prompts';
import * as dotenv from 'dotenv';
import application from '../models/application';
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

	// Select action
	const action = await select({
		message: 'Select action to perform',
		choices: [
			{
				name: "Modify a hacker's document",
				value: 'modify-hacker',
			},
		],
	});

	// Perform action
	switch (action) {
		case 'modify-hacker':
			await handleModifyHacker();
			break;
		default:
			console.log('Invalid action');
	}
};

/**
 * Quickly change the application status of hacker.
 * A hacker has multiple application statuses.
 */
const handleModifyHacker = async () => {
	const hackerEmail = await input({
		message: 'Enter hacker email',
	});

	const subAction1 = await select({
		message: 'Select sub-action to perform',
		choices: [
			{
				name: 'Change application status to CREATED',
				value: 'created',
			},
			{
				name: 'Change application status to DECLINED',
				value: 'declined',
			},
			{
				name: 'Change application status to SUBMITTED',
				value: 'submitted',
			},
			{
				name: 'Change application status to ACCEPTED',
				value: 'accepted',
			},
			{
				name: 'Change application status to CONFIRMED',
				value: 'confirmed',
			},
			{
				name: 'Change application status to REJECTED',
				value: 'rejected',
			},
			{
				name: 'Change application status to CHECKED_IN',
				value: 'checked-in',
			},
		],
	});

	const subAction2 = await select({
		message: "Do you want to delete the hacker's application?",
		choices: [
			{
				name: 'Yes',
				value: 'yes',
			},
			{
				name: 'No',
				value: 'no',
			},
		],
	});
};

// Execute the CLI tool
executeCLI();
