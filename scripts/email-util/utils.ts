import { readFile } from 'fs/promises';
import promptSync from 'prompt-sync';
import dbConnect from '../../middleware/database';
import { UserData } from '../../types/database';
import User from '../../models/user';

const prompt = promptSync({ sigint: true });

const getYesOrNo = (promptString: string) => {
	let input: string = prompt(promptString);
	while (input !== 'y' && input !== 'n') {
		input = prompt('    Please enter either y or n: ');
	}
	return input;
};

const getBody = async (promptString: string) => {
	let filePath: string = prompt(promptString);
	let file: string = '';
	let hasError: boolean = false;

	do {
		if (hasError) {
			filePath = prompt('    Bad file path! Try again: ');
		}

		try {
			file = await readFile(filePath, 'utf8');
			hasError = false;
		} catch (err) {
			hasError = true;
		}
	} while (hasError);

	return { file, filePath };
};

const getStatuses = () => {
	let rawStatuses: string = prompt(
		'Enter the ApplicationStatus(es) of the hackers you want to receive your email as integers delimited by commas (required): '
	);
	let statuses: number[] = [];
	let hasError: boolean = false;

	do {
		if (hasError) {
			rawStatuses = prompt('    Bad ApplicationStatus(es)! Try again: ');
		}

		try {
			// Check if JSON.parse has no error
			statuses = JSON.parse('[' + rawStatuses + ']');
			hasError = false;

			if (statuses.length === 0) {
				hasError = true;
			}

			// Check if statuses are valid ApplicationStatus enum values
			// TODO: THIS IS HARDCODED! MAY NEED TO UPDATE IN FUTURE
			for (let i = 0; !hasError && i < statuses.length; i++) {
				if (!(statuses[i] in [0, 1, 2, 3, 4, 5, 6, 7])) {
					hasError = true;
				}
			}
		} catch (err) {
			hasError = true;
		}
	} while (hasError);

	return statuses;
};

const splitEmails = (emails: string[]) => {
	const chunkSize = 50;
	const chunkedEmails = [];
	for (let i = 0; i < emails.length; i += chunkSize) {
		chunkedEmails.push(emails.slice(i, i + chunkSize));
	}
	return chunkedEmails;
};

const getQueriedRecipients = async (statuses: number[]) => {
	await dbConnect(process.env.DATABASE_URL);

	const query = {
		$and: [{ userType: 'HACKER' }, { applicationStatus: { $in: statuses } }],
	};

	const hackers: UserData[] = await User.find(query);
	const emails = hackers.map(hacker => hacker.email);

	return { chunkedEmails: splitEmails(emails), emails };
};

export const getSubject = () => {
	let subject: string = prompt('Enter the email subject (required): ');
	while (subject === '') {
		subject = prompt('    Please enter the email subject: ');
	}
	return subject;
};

export const getHtmlBody = async () => {
	return getYesOrNo('Does the email support an HTML body? (y/n) ') === 'y'
		? getBody('Enter the path to the HTML body: ')
		: { file: '', filePath: '' };
};

export const getTextBody = async () => {
	return getBody('Enter the path to the plain text body (required): ');
};

export const getRecipients = async (hardcodedRecipients: string[]) => {
	if (getYesOrNo('Did you hardcode the recipients? (y/n) ') === 'y') {
		return { chunkedEmails: splitEmails(hardcodedRecipients), emails: hardcodedRecipients, statuses: [] };
	} else {
		// ApplicationStatus(es)
		const statuses = getStatuses();

		// Email addresses
		const { chunkedEmails, emails } = await getQueriedRecipients(statuses);

		return { chunkedEmails, emails, statuses };
	}
};

export const getConfirmation = (inputtedData: any) => {
	const { allRecipients, ...inputs } = inputtedData;

	console.log('\nHere is what you entered: ');
	if (inputs['ApplicationStatus(es)'].length === 0) {
		delete inputs['ApplicationStatus(es)'];
	}
	console.log(inputs);

	if (getYesOrNo('\nWould you like to see the full recipient list? (y/n) ') === 'y') {
		console.log(allRecipients);
	}

	if (getYesOrNo('\nWould you like to send your email? (y/n) ') === 'n') {
		console.log('\nHave a nice day!');
		process.exit(0);
	}
};
