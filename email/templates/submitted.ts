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
				Data: await fillHtmlTemplate('submitted', {
					name: escapeChars(user.name),
					_id: user._id.path,
				}),
			},
			Text: {
				Charset: 'UTF-8',
				Data: `Thank you for applying!
				Hi ${escapeChars(user.name)},
				Thanks for taking the time to complete your application! We’re so excited that you’re interested in being a part of VandyHacks X: Neon Edition.
				We will be reviewing your submission soon, so be on the lookout for another email regarding your status.
				Until then, stay hyped about VandyHacks! Follow us on Instagram to get the latest VH updates!
				Cheers,
				The VandyHacks Team`,
			},
		},
		Subject: {
			Charset: 'UTF-8',
			Data: "We've Received Your Application!",
		},
	},
	Source: 'VandyHacks <updates@vandyhacks.org>',
});
