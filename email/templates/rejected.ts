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
				Data: await fillHtmlTemplate('rejected', {
					name: escapeChars(user.name),
					_id: user._id.path,
				}),
			},
			Text: {
				Charset: 'UTF-8',
				Data: `Hi ${escapeChars(user.name)},
                Thank you for your interest in VandyHacks XI: Racing Edition. Unfortunately, we are unable to offer you a spot at this year's event.
                We really appreciate your interest and hope you will apply to another VandyHacks opportunity in the future.
                Best,
                The VandyHacks Team`,
			},
		},
		Subject: {
			Charset: 'UTF-8',
			Data: 'Thank you for applying to VandyHacks',
		},
	},
	Source: 'VandyHacks <updates@vandyhacks.org>',
});
