/* eslint-disable import/no-anonymous-default-export */
import { SendEmailRequest } from '@aws-sdk/client-ses';

export interface EmailData {
	emails: string[];
	subject: string;
	html: string;
	text: string;
}

/**
 * emails: list of strings
 */
export const template = async ({ emails, subject, html, text }: EmailData): Promise<SendEmailRequest> => ({
	Destination: {
		ToAddresses: emails, // Email address/addresses that you want to send your email
	},
	Message: {
		Body: {
			Html: {
				// HTML Format of the email
				Charset: 'UTF-8',
				Data: html ? html : text,
			},
			Text: {
				Charset: 'UTF-8',
				Data: text,
			},
		},
		Subject: {
			Charset: 'UTF-8',
			Data: subject,
		},
	},
	Source: 'VandyHacks <updates@vandyhacks.org>',
});
