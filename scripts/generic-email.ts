import sendEmail from '../email/email';
import { template, EmailData } from './email-util/template';
import * as dotenv from 'dotenv';
import { getSubject, getHtmlBody, getTextBody, getRecipients, getConfirmation } from './email-util/utils';
dotenv.config();

// NOTE: FOR GETSTATUSES FUNCTION, MAY NEED TO UPDATE THE ARRAY OF POSSIBLE APPLICATIONSTATUS(ES)

// Hard code recipients
const hardcodedRecipients: string[] = ['carolhe.che.17@gmail.com', 'hycarolhy@yahoo.com'];

const promptUser = async () => {
	// Subject
	const subject = getSubject();

	// HTML body
	const { file: htmlBody, filePath: htmlPath } = await getHtmlBody();

	// Plain text body
	const { file: textBody, filePath: textPath } = await getTextBody();

	// Recipients
	const { chunkedEmails, emails, statuses } = await getRecipients(hardcodedRecipients);

	// Confirmation
	const inputtedData = {
		'Subject Line': subject,
		'HTML Body': htmlPath,
		'Plain Text Body': textPath,
		'ApplicationStatus(es)': statuses,
		'Number of Recipients': emails.length,
		'First 50 (or so) Recipients': chunkedEmails.length === 0 ? '' : chunkedEmails[0],
		allRecipients: emails,
	};

	getConfirmation(inputtedData);

	const emailData: EmailData = {
		emails: [],
		subject,
		htmlBody,
		textBody,
	};

	return { emailData, chunkedEmails };
};

const execute = async () => {
	const { emailData, chunkedEmails } = await promptUser();

	for (let i = 0; i < chunkedEmails.length; i++) {
		emailData.emails = chunkedEmails[i];
		await sendEmail(template(emailData));

		console.log('\nSuccessfully sent to the following emails: ');
		console.log(emailData.emails);

		setTimeout(() => {
			console.log('3 sec delay has ended!');
		}, 3000);
	}
};

(async () => {
	try {
		await execute();
		console.log('\nSuccessfully sent all emails!');
		process.exit(0);
	} catch (err) {
		console.error('Something went wrong :(');
		console.error(err);
		process.exit(1);
	}
})();
