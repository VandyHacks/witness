/* eslint-disable import/no-anonymous-default-export */
import { SendEmailRequest } from '@aws-sdk/client-ses';

/**
 * Type for email data
 */
export interface EmailData {
	emails: string[];
	subject: string;
	htmlBody: string;
	textBody: string;
}

/**
 * Template for sending email using AWS SES
 * @param object Deconstruct input for email data
 * @returns Email data in the form that AWS SES requires
 */
export const template = ({ emails, subject, htmlBody, textBody }: EmailData): SendEmailRequest => ({
	Destination: {
		// BCC recipients for mass emailing
		BccAddresses: emails,
	},

	Message: {
		Body: {
			// HTML Format of the email body
			Html: {
				Charset: 'UTF-8',
				// If there is no HTML body, pass the plain text body
				Data: htmlBody ? htmlBody : textBody,
			},

			// Plain text Format of the email body
			Text: {
				Charset: 'UTF-8',
				Data: textBody,
			},
		},

		// Subject of email
		Subject: {
			Charset: 'UTF-8',
			Data: subject,
		},
	},
	Source: 'VandyHacks <updates@vandyhacks.org>',
});
