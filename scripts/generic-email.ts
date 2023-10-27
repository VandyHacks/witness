import * as dotenv from 'dotenv';
import sendEmail from '../email/email';
import { template, EmailData } from './email-util/template';
import {
	InputData,
	printInstructionsOrWarning,
	getSubject,
	getHtmlBody,
	getTextBody,
	getRecipients,
	getConfirmation,
} from './email-util/utils';
dotenv.config();

// NOTE: To use this CLI tool, run `yarn email` in your terminal.

// ***Update this object if sending to hardcoded recipient email addresses***
const hardcodedRecipients: string[] = ['carolhe.che.17@gmail.com', 'hycarolhy@yahoo.com'];

/**
 * Calls sendAllEmails to attempt to send emails to all recipients
 */
const executeCLI = async () => {
	// Try to send emails
	try {
		await sendAllEmails();
		console.log('\nSuccessfully sent all emails!');
	} catch (err) {
		console.error('\nAn error has occurred! You are a dev, right? Fix it: ');
		console.error(err);
	}

	// Exit tool
	process.exit(0);
};

/**
 * Calls promptUser to get data that is passed to AWS SES
 * Sends emails to 50 recipients at a time with 3 sec delays in between
 */
const sendAllEmails = async () => {
	// User-provided email data
	const { emailData, chunkedEmails } = await promptUser();

	// Send email to all recipients
	for (let i = 0; i < chunkedEmails.length; i++) {
		// Send email to <= 50 recipients
		emailData.emails = chunkedEmails[i];
		await sendEmail(template(emailData));

		// Log successful emails
		console.log('\nSuccessfully sent to the following recipients: ');
		console.log(emailData.emails);

		// 3 sec delay
		setTimeout(() => {
			console.log('3 sec delay has ended!');
		}, 3000);
	}
};

/**
 * Prompts user to input email data
 * @returns emailData     Contains subject, HTML body, and plain text body
 * @returns chunkedEmails Contains email addresses of all recipients in chunks of 50
 */
const promptUser = async () => {
	// Instructions
	printInstructionsOrWarning();

	// Subject
	const subject = getSubject();

	// HTML body
	const { file: htmlBody, filePath: htmlPath } = await getHtmlBody();

	// Plain text body
	const { file: textBody, filePath: textPath } = await getTextBody();

	// Recipients
	const { chunkedEmails, emails, statuses } = await getRecipients(hardcodedRecipients);

	// Confirmation
	const inputData: InputData = {
		'Subject Line': subject,
		'HTML Body': htmlPath,
		'Plain Text Body': textPath,
		'ApplicationStatus(es)': statuses,
		'Number of Recipients': emails.length,
		'First 50 (or so) Recipients': chunkedEmails.length === 0 ? [] : chunkedEmails[0],
		allRecipients: emails,
	};

	getConfirmation(inputData);

	// Return user-provided email data
	const emailData: EmailData = {
		emails: [],
		subject,
		htmlBody,
		textBody,
	};

	return { emailData, chunkedEmails };
};

// Execute the CLI tool
executeCLI();
