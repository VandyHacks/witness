import sendEmail from '../email/email';
import { template, EmailData } from './email-util/template';
import * as dotenv from 'dotenv';
import promptSync from 'prompt-sync';
import dbConnect from '../middleware/database';
import User from '../models/user';
import { UserData } from '../types/database';
import {
	getHardcodeRecipients,
	getSubject,
	getHtmlBody,
	getTextBody,
	getStatuses,
	getRecipients,
	getConfirmation,
	splitEmails,
} from './email-util/utils';
dotenv.config();

// Hard code recipients
const hardcodedRecipients: string[] = ['carolhe.che.17@gmail.com', 'hycarolhy@yahoo.com'];

const prompt = promptSync({ sigint: true });

const emailData: EmailData = {
	emails: [],
	subject: '',
	htmlBody: '',
	textBody: '',
};

const promptUser = async () => {
	// Hardcode Recipients?
	const hardcodeRecipients = getHardcodeRecipients(prompt);

	// Subject
	const subject = getSubject(prompt);

	// HTML body
	const { htmlBody, htmlPath } = await getHtmlBody(prompt);

	// Plain text body
	const { textBody, textPath } = await getTextBody(prompt);

	if (hardcodeRecipients) {
		const inputtedData = {
			'Subject Line': subject,
			'HTML Body': htmlPath,
			'Plain Text Body': textPath,
		};

		getConfirmation(prompt, inputtedData, hardcodeRecipients);

		const emailData: EmailData = {
			emails: [],
			subject,
			htmlBody,
			textBody,
		};

		return { emailData, chunkedEmails: null };
	} else {
		// ApplicationStatus(es)
		const statuses = getStatuses(prompt);

		// Email addresses
		const { chunkedEmails, emails } = await getRecipients(statuses);

		// // TODO: EXTRACT INTO SEPARATE FUNCTION
		// // 		parameters: prompt, statuses
		// // 		include the slicing stuffs
		// // 		return: chunkedEmails, total number of emails
		// await dbConnect(process.env.DATABASE_URL);
		//
		// const query = {
		// 	$and: [{ userType: 'HACKER' }, { applicationStatus: { $in: statuses } }],
		// };
		//
		// const hackers: UserData[] = await User.find(query);
		//
		// // SLICE EMAILS INTO CHUNKS OF 50
		// const chunkSize = 50;
		// const allEmails = hackers.map(hacker => hacker.email);
		// const chunkedEmails = [];
		// for (let i = 0; i < allEmails.length; i += chunkSize) {
		// 	chunkedEmails.push(allEmails.slice(i, i + chunkSize));
		// }
		// console.log(chunkedEmails);
		// // console.log(chunkedEmails.length);
		// // console.log(chunkedEmails[0].length);
		// // console.log(chunkedEmails[1].length);
		// // console.log(allEmails.length);

		// Confirmation
		const inputtedData = {
			'Subject Line': subject,
			'HTML Body': htmlPath,
			'Plain Text Body': textPath,
			'Ok ApplicationStatus(es)': statuses,
			'Number of Recipients': emails.length,
			'First 50 (or so) Recipients': chunkedEmails.length === 0 ? '' : chunkedEmails[0],
		};

		// // TODO: EXTRACT INTO SEPARATE FUNCTION
		// // 		parameters: emailData, htmlPath, textPath, statuses, total number of emails, chunkedEmails
		// console.log('Here is what you entered: ');
		// const inputtedData = {
		// 	'Subject Line': emailData.subject,
		// 	'HTML Body': htmlPath,
		// 	'Plain Text Body': textPath,
		// 	'Ok ApplicationStatus(es)': statuses,
		// 	'Number of Recipients': emails.length,
		// 	'First 50 (or so) Recipients': chunkedEmails.length === 0 ? '' : chunkedEmails[0],
		// };
		// console.log(inputtedData);

		// let hasConfirmed = prompt('Would you like to send your email? (y/n) ');

		// while (hasConfirmed !== 'y' && hasConfirmed !== 'n') {
		// 	hasConfirmed = prompt('Please enter either y or n: ');
		// }

		// if (hasConfirmed === 'n') {
		// 	console.log('Have a nice day!');
		// 	process.exit(0);
		// }
		getConfirmation(prompt, inputtedData, hardcodeRecipients, emails);

		const emailData: EmailData = {
			emails: [],
			subject,
			htmlBody,
			textBody,
		};

		return { emailData, chunkedEmails };
	}
};

const execute = async () => {
	let recipients = [];
	const { emailData, chunkedEmails } = await promptUser();

	if (chunkedEmails) {
		recipients = chunkedEmails;
	} else {
		recipients = splitEmails(hardcodedRecipients);
	}

	for (let i = 0; i < recipients.length; i++) {
		emailData.emails = recipients[i];
		await sendEmail(template(emailData));
		console.log(emailData.emails);

		setTimeout(() => {
			console.log('wait has ended!');
		}, 3000);
	}
};

// TODO: REVISE THIS TO BE A FUNCTION FOR SENDING HARDCODED EMAIL LIST
// 		users need to manually update the hard coded email list in this script file
// 		create a diff promptUser function for hard coded emails specifically
// 		OR add a branch in current promptUser funtion for hard coded emails specifically
// const execute_UNSENT = async () => {
// 	const { emailData, chunkedEmails } = await promptUser();

// 	for (let i = 0; i < UNSENT_HACKERS.length; i++) {
// 		emailData.emails = UNSENT_HACKERS[i];
// 		await sendEmail(template(emailData));
// 		console.log(UNSENT_HACKERS[i]);

// 		setTimeout(function () {
// 			console.log('wait has ended!');
// 		}, 3000);
// 	}
// };

// TODO: allow user to choose between hard coded email list vs queries email list
// 		toggle between using execute() and execute_hardcoded()
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
