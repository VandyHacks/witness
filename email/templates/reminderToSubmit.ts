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
				Data: await fillHtmlTemplate('reminderToSubmit', {
					name: escapeChars(user.name),
					_id: user._id.path,
				}),
			},
			Text: {
				Charset: 'UTF-8',
				Data: `Applications Closing Soon!
				Hi ${escapeChars(user.name)},
				We’ve noticed you’ve created an application with us, but we do not have a record of your submission. We would love to have you join VandyHacks X!
				Make sure you apply at vandyhacks.org by October 16th, at 11:59pm to have the chance to create unique projects, win prizes, attend workshops/speaker events, network with our sponsors, receive cool swag, eat free food, and so much more! 
				Feel free to email us at info@vandyhacks.org if you have any questions
				Cheers,
				The VandyHacks Team`,
			},
		},
		Subject: {
			Charset: 'UTF-8',
			Data: 'Applications Closing Soon!',
		},
	},
	Source: 'VandyHacks <updates@vandyhacks.org>',
});
