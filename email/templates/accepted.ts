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
				Data: await fillHtmlTemplate('accepted', {
					name: escapeChars(user.name || user.name),
					_id: user._id.path,
				}),
			},
			Text: {
				Charset: 'UTF-8',
				Data: `Hi ${escapeChars(user.name || user.name)},
				Congratulations! You’re invited to be a part of VandyHacks XI: Racing Edition! We enjoyed reading your application and would love to see your ideas come to life during our event on September 28th-29th!

				Head over to the application portal here and confirm your attendance by September 26th, 12:00 PM CDT.

				If you have any questions or concerns, check out our FAQ or reach out to us at info@vandyhacks.org. In the meantime join our discord server to stay up to date on the latest VH news!

				Cheers,
				The VandyHacks Team
				`,
			},
		},
		Subject: {
			Charset: 'UTF-8',
			Data: "You've Been Accepted!",
		},
	},
	Source: 'VandyHacks <updates@vandyhacks.org>',
});
