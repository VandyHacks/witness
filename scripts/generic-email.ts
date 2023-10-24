import sendEmail from '../email/email';
import { template, EmailData } from './email-util/template';
import * as dotenv from 'dotenv';
import promptSync from 'prompt-sync';
import dbConnect from '../middleware/database';
import User from '../models/user';
import { UserData } from '../types/database';
import { getBody } from './email-util/utils';
dotenv.config();

const prompt = promptSync({ sigint: true });

const emailData: EmailData = {
	emails: [],
	subject: '',
	html: '',
	text: '',
};

const promptUser = async () => {
	// Subject
	emailData.subject = prompt('Enter the email subject: ');

	// HTML body
	let hasHTML = prompt('Does the email support an HTML body? (y/n) ');

	while (hasHTML !== 'y' && hasHTML !== 'n') {
		hasHTML = prompt('Please enter either y or n: ');
	}

	let htmlPath = '';
	if (hasHTML === 'y') {
		const { file, filePath } = await getBody('Enter the path to the HTML body: ', prompt);
		emailData.html = file;
		htmlPath = filePath;
	}

	// Plain text body
	const { file: text, filePath: textPath } = await getBody(
		'Enter the path to the plain text body (required): ',
		prompt
	);
	emailData.text = text;

	// Hacker ApplicationStatus processing
	// TODO: ERROR HANDLING
	const rawStatuses = prompt('Enter the ApplicationStatus(es) of the hackers you want to receive your email: ');
	const statuses = JSON.parse('[' + rawStatuses + ']');
	console.log(statuses);

	const rawNonStatuses = prompt(
		'Enter the ApplicationStatus(es) of the hackers you do not want to receive your email: '
	);
	const nonStatuses = JSON.parse('[' + rawNonStatuses + ']');
	console.log(nonStatuses);

	// Email addresses
	await dbConnect(process.env.DATABASE_URL);

	const query = {
		$and: [
			{ userType: 'HACKER' },
			{ applicationStatus: { $in: statuses } },
			{ applicationStatus: { $not: { $in: nonStatuses } } },
		],
	};

	const hackers: UserData[] = await User.find(query);

	emailData.emails = hackers.map(hacker => hacker.email);
	console.log(emailData.emails);

	// Confirmation
	console.log('Here is what you entered: ');
	const inputtedData = {
		'Subject Name': emailData.subject,
		'HTML Body': htmlPath,
		'Plain Text Body': textPath,
		'Ok ApplicationStatus(es)': statuses,
		'Not Ok ApplicationStatus(es)': nonStatuses,
		'Number of Email Addresses': hackers.length,
	};
	console.log(inputtedData);

	let hasConfirmed = prompt('Would you like to send your email? (y/n) ');

	while (hasConfirmed !== 'y' && hasConfirmed !== 'n') {
		hasConfirmed = prompt('Please enter either y or n: ');
	}

	if (hasConfirmed === 'n') {
		console.log('Have a nice day!');
		process.exit(0);
	}
};

const execute = async () => {
	await promptUser();
	await sendEmail(await template(emailData));
};

(async () => {
	try {
		await execute();
		console.log('Successfully sent email!');
		process.exit(0);
	} catch (err) {
		console.error('Did not successfully send email :(');
		console.error(err);
		process.exit(0);
	}
})();
