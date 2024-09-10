/* eslint-disable import/no-anonymous-default-export */
import { SendEmailRequest } from '@aws-sdk/client-ses';
import { UserData } from '../../types/database';
import { escapeChars } from '../email';
import { fillHtmlTemplate } from '../utils';

// TODO: Dedupe these emails. All the HTML is the same, the only difference is in the
// actual lines presented to the user, which could be parameterized. Rich HTML content
// (links only so far) could be tricky if we want to re-use the same HTML for text and
// HTML sections.

export default async (user: UserData): Promise<SendEmailRequest> => ({
	Destination: {
		ToAddresses: [user.email], // Email address/addresses that you want to send your email
	},
	Message: {
		Body: {
			Html: {
				// HTML Format of the email
				Charset: 'UTF-8',
				Data: await fillHtmlTemplate('confirmed', {
					name: escapeChars(user.name),
					_id: user._id.path,
				}),
			},
			Text: {
				Charset: 'UTF-8',
				Data: `Hey ${escapeChars(user.name)},
				We're so excited that you'll be joining us for VandyHacks XI: Racing Edition!

				This email is just to confirm that you've RSVPed to our event. We'll be in touch again soon with more information on our opening ceremony, but as a reminder, festivities will start at 12:00 PM CDT Saturday, September 28th, and wrap up by 5:30 PM CDT Sunday, September 29th.

				In the meantime, be sure to complete the following:

				Join our Discord here for communication before, during, and after the hackathon!
				Review the full hackathon schedule here!
				Follow us on Instagram for sneak peeks of the organizers in action!

				NOTE: If you are no longer able to attend, please email us ASAP so that we can get an accurate attendance count.

				See you soon!
				The VandyHacks Team`,
			},
		},
		Subject: {
			Charset: 'UTF-8',
			Data: 'See you soon!',
		},
	},
	Source: 'VandyHacks <updates@vandyhacks.org>',
});
