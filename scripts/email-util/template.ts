/* eslint-disable import/no-anonymous-default-export */
import { SendEmailRequest } from '@aws-sdk/client-ses';

export interface EmailData {
	emails: string[];
	subject: string;
	htmlBody: string;
	textBody: string;
}

/**
 * emails: list of strings
 */
export const template = ({ emails, subject, htmlBody, textBody }: EmailData): SendEmailRequest => ({
	Destination: {
		BccAddresses: emails, // Email address/addresses that you want to send your email
	},
	Message: {
		Body: {
			Html: {
				// HTML Format of the email
				Charset: 'UTF-8',
				Data: htmlBody ? htmlBody : textBody,
			},
			Text: {
				Charset: 'UTF-8',
				Data: textBody,
			},
		},
		Subject: {
			Charset: 'UTF-8',
			Data: subject,
		},
	},
	Source: 'VandyHacks <updates@vandyhacks.org>',
});
