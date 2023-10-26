import { readFile } from 'fs/promises';
import promptSync from 'prompt-sync';
import dbConnect from '../../middleware/database';
import { UserData } from '../../types/database';
import User from '../../models/user';
import { EmailData } from '../email-util/template';

export const getSubject = (prompt: promptSync.Prompt) => {
	let subject = prompt('Enter the email subject (required): ');

	while (subject === '') {
		subject = prompt('Please enter the email subject: ');
	}

	return subject;
};

const getBody = async (promptString: string, prompt: promptSync.Prompt) => {
	let filePath = prompt(promptString);
	let file = '';
	let hasError = false;

	do {
		if (hasError) {
			filePath = prompt('Bad file path! Try again: ');
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

export const getHtmlBody = async (prompt: promptSync.Prompt) => {
	let htmlBody = '';
	let htmlPath = '';

	let hasHTML = prompt('Does the email support an HTML body? (y/n) ');

	while (hasHTML !== 'y' && hasHTML !== 'n') {
		hasHTML = prompt('Please enter either y or n: ');
	}

	if (hasHTML === 'y') {
		const { file, filePath } = await getBody('Enter the path to the HTML body: ', prompt);
		htmlBody = file;
		htmlPath = filePath;
	}

	return { htmlBody, htmlPath };
};

export const getTextBody = async (prompt: promptSync.Prompt) => {
	const { file: textBody, filePath: textPath } = await getBody(
		'Enter the path to the plain text body (required): ',
		prompt
	);
	return { textBody, textPath };
};

export const getStatuses = (prompt: promptSync.Prompt) => {
	let rawStatuses = prompt(
		'Enter the ApplicationStatus(es) of the hackers you want to receive your email as integers delimited by commas (required): '
	);
	let statuses = [];
	let hasError = false;

	do {
		if (hasError) {
			rawStatuses = prompt('Bad ApplicationStatus(es)! Try again: ');
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

// SLICE EMAILS INTO CHUNKS OF 50
export const splitEmails = (emails: string[]) => {
	const chunkSize = 50;
	const chunkedEmails = [];
	for (let i = 0; i < emails.length; i += chunkSize) {
		chunkedEmails.push(emails.slice(i, i + chunkSize));
	}
	return chunkedEmails;
};

export const getRecipients = async (statuses: number[]) => {
	await dbConnect(process.env.DATABASE_URL);

	const query = {
		$and: [{ userType: 'HACKER' }, { applicationStatus: { $in: statuses } }],
	};

	const hackers: UserData[] = await User.find(query);
	const emails = hackers.map(hacker => hacker.email);

	return { chunkedEmails: splitEmails(emails), emails };
};

// todo: extract the while stuffs
// todo: make terminal more readable
export const getConfirmation = (prompt: promptSync.Prompt, inputtedData: any, emails: string[]) => {
	console.log('Here is what you entered: ');
	console.log(inputtedData);

	let wantAllRecipients = prompt('Would you like to see the full recipient list? (y/n) ');

	while (wantAllRecipients !== 'y' && wantAllRecipients !== 'n') {
		wantAllRecipients = prompt('Please enter either y or n: ');
	}

	if (wantAllRecipients === 'y') {
		console.log(emails);
	}

	let hasConfirmed = prompt('Would you like to send your email? (y/n) ');

	while (hasConfirmed !== 'y' && hasConfirmed !== 'n') {
		hasConfirmed = prompt('Please enter either y or n: ');
	}

	if (hasConfirmed === 'n') {
		console.log('Have a nice day!');
		process.exit(0);
	}
};
