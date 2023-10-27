import { readFile } from 'fs/promises';
import promptSync from 'prompt-sync';
import dbConnect from '../../middleware/database';
import User from '../../models/user';
import { UserData } from '../../types/database';

/**
 * Prompts user for input
 * Allows user to enter Ctrl+C to exit tool
 */
const prompt = promptSync({ sigint: true });

/**
 * Type for input data confirmation
 */
export interface InputData {
	'Subject Line': string;
	'HTML Body': string;
	'Plain Text Body': string;
	'ApplicationStatus(es)'?: number[];
	'Number of Recipients': number;
	'First 50 (or so) Recipients': string[];
	allRecipients: string[];
}

/**
 * Gets yes or no input
 * @param promptString Prompt message
 * @returns 'y' or 'n'
 */
const getYesOrNo = (promptString: string) => {
	let input: string = prompt(promptString);

	// Validate input
	while (input !== 'y' && input !== 'n') {
		input = prompt('    Please enter either y or n: ');
	}

	return input;
};

/**
 * Gets the file contents given the file path
 * @param promptString Prompt message
 * @returns file     File content as a string
 * @returns filePath Given path to file
 */
const getBody = async (promptString: string) => {
	let filePath: string = prompt(promptString);
	let file: string = '';
	let hasError: boolean = false;

	// Validate input
	do {
		// Ask user for another input if error
		if (hasError) {
			filePath = prompt('    Bad file path! Try again: ');
		}

		// Try to read file from file path
		try {
			file = await readFile(filePath, 'utf8');
			hasError = false;
		} catch (err) {
			hasError = true;
		}
	} while (hasError);

	return { file, filePath };
};

/**
 * Gets the ApplicationStatus(es) of recipients
 * @returns List of non-negative integer values representing ApplicationStatus(es)
 */
const getStatuses = () => {
	// Valid ApplicationStatus values
	const validApplicationStatusValues = [0, 1, 2, 3, 4, 5, 6, 7];

	let rawStatuses: string = prompt(
		'ApplicationStatus(es) of hacker recipients as integers delimited by commas (required): '
	);
	let statuses: number[] = [];
	let hasError: boolean = false;

	// Validate input
	do {
		// Ask user for another input if error
		if (hasError) {
			rawStatuses = prompt('    Bad ApplicationStatus(es)! Try again: ');
		}

		try {
			// Check if JSON.parse has no error
			statuses = JSON.parse('[' + rawStatuses + ']');
			hasError = false;

			// Check if there is an input
			if (statuses.length === 0) {
				hasError = true;
			}

			// Check if statuses are valid ApplicationStatus values
			for (let i = 0; !hasError && i < statuses.length; i++) {
				if (!(statuses[i] in validApplicationStatusValues)) {
					hasError = true;
				}
			}
		} catch (err) {
			hasError = true;
		}
	} while (hasError);

	return statuses;
};

/**
 * Splits given email list into chunks of 50 emails
 * @param emails List of emails for all recipients
 * @returns List of lists of size <= 50 containing email addresses
 */
const splitEmails = (emails: string[]) => {
	const chunkSize = 50;
	const chunkedEmails = [];
	for (let i = 0; i < emails.length; i += chunkSize) {
		chunkedEmails.push(emails.slice(i, i + chunkSize));
	}
	return chunkedEmails;
};

/**
 * Get recipient email addresses from MongoDB given the ApplicationStatus(es)
 * @param statuses List of ApplicationStatus(es) used to query recipients
 * @returns chunkedEmails List of emails in chunks of 50
 * @returns emails        List of all emails
 */
const getQueriedRecipients = async (statuses: number[]) => {
	// Connect to database
	await dbConnect(process.env.DATABASE_URL);

	// Query for hackers with one of the given ApplicationStatus(es)
	const query = {
		$and: [{ userType: 'HACKER' }, { applicationStatus: { $in: statuses } }],
	};

	// Find hackers
	const hackers: UserData[] = await User.find(query);

	// Get hacker emails
	const emails = hackers.map(hacker => hacker.email);

	return { chunkedEmails: splitEmails(emails), emails };
};

/**
 * Print instructions or warning for this tool
 */
export const printInstructionsOrWarning = () => {
	if (getYesOrNo('Do you want to see the instructions for this CLI tool? (y/n) ') === 'y') {
		// Print instructions
		const instructions =
			"\n\nThis CLI tool is used to mass email hackers! To prevent accidental mass emailing, please read all of the following instructions carefully!\
			\n\
			\n1.  If you're testing this tool, update your .env to use the test database. Otherwise, update your .env to use the production database.\
			\n2.  If there are < or > 8 values for the enum ApplicationStatus (see types/database.ts), update lines 78 and 167 in scripts/email-util/utils.ts accordingly, and make a PR for these changes.\
			\n3.  Know what the email's subject line is.\
			\n4.  If your email has an HTML body, create a .html file with your content.\
			\n5.  Create a plain text version of your content in another file. This is required!\
			\n6a. If you are hardcoding the recipient email addresses, add the email addresses in the `hardcodedRecipients` object in scripts/generic-email.ts on line 18.\
			\n6b. If you are querying the database for the recipient email addresses, determine the integer values of the ApplicationStatus(es) of the recipients (see types/database.ts).\
			\n7.  Once you have done steps 1-6, save all of your changes, run `yarn email`, and follow all of the prompts carefully!\
			\nNote: At any point, you can enter Ctrl-C to exit this tool.\
			\n\
			\nGood luck with mass emailing!\n";

		console.log(instructions);

		// Exit tool
		process.exit(0);
	} else {
		// Print warning
		const warning =
			'\n\u001b[1;31mPlease verify the following before using this tool!\u001b[0m\
			\n    scripts/generic-email.ts: `hardcodedRecipients` object on line 18\
			\n                        .env: `DATABASE_URL` value\
			\n\u001b[1;33mThe Dev Director(s) and innocent hackers want to say thanks in advance :)\n\u001b[0m\
			';

		console.log(warning);
	}
};

/**
 * Get email subject
 * @returns Subject of email
 */
export const getSubject = () => {
	let subject: string = prompt('Email subject (required): ');

	// Validate input
	while (subject === '') {
		subject = prompt('    Please enter the email subject: ');
	}

	return subject;
};

/**
 * Get HTML body
 * @returns file     HTML body content
 * @returns filePath File path to HTML body
 */
export const getHtmlBody = async () => {
	return getYesOrNo('Does the email support an HTML body? (y/n) ') === 'y'
		? // Get HTML body
		  getBody('Path to the HTML body: ')
		: // Return empty strings if no HTML body
		  { file: '', filePath: '' };
};

/**
 * Get plain text body
 * @returns file     Plain text body content
 * @returns filePath File path to plain text body
 */
export const getTextBody = async () => {
	return getBody('Path to the plain text body (required): ');
};

/**
 * Get email recipients
 * @param hardcodedRecipients List of hardcoded recipient email addresses
 * @returns chunkedEmails List of emails in chunks of 50
 * @returns emails        List of all emails
 * @returns statuses      List of non-negative integer values representing ApplicationStatus(es)
 */
export const getRecipients = async (hardcodedRecipients: string[]) => {
	// Ask user if they hardcoded recipients
	if (getYesOrNo('Did you hardcode the recipients? (y/n) ') === 'y') {
		// Split hardcoded recipient emails into chunks of 50
		return { chunkedEmails: splitEmails(hardcodedRecipients), emails: hardcodedRecipients, statuses: [] };
	} else {
		// Get ApplicationStatus(es)
		const statuses = getStatuses();

		// Get emails from MongoDB
		const { chunkedEmails, emails } = await getQueriedRecipients(statuses);

		return { chunkedEmails, emails, statuses };
	}
};

/**
 * Display inputted data and ask for email confirmation
 * @param inputData User-inputted data
 */
export const getConfirmation = (inputData: InputData) => {
	const { allRecipients, ...inputs } = inputData;

	// If recipients are hardcoded, then there are no ApplicationStatus(es)
	if (inputs['ApplicationStatus(es)']?.length === 0) {
		delete inputs['ApplicationStatus(es)'];
	}

	// Print inputted data
	console.log('\nPlease confirm what you entered: \n', inputs);

	// Ask user if they want to see the full recipient list
	if (getYesOrNo('\nSee the full recipient list? (y/n) ') === 'y') {
		console.log(allRecipients);
	}

	// Ask user if they want to send emails
	if (getYesOrNo('\nReady to send your email? (y/n) ') === 'n') {
		console.log('\nHave a nice day!\n');

		// Exit tool
		process.exit(0);
	}
};
