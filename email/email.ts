import { SendEmailRequest, SES } from '@aws-sdk/client-ses';
import * as dotenv from 'dotenv';
dotenv.config();

export const escapeChars = (str: string) => {
	return str.replace(/[&<>"`=\/]/g, '');
};

const ses = new SES({
	region: 'us-east-2',
	credentials: {
		accessKeyId: process.env.VH_AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.VH_AWS_SECRET_ACCESS_KEY!,
	},
});

const sendEmail = (email: SendEmailRequest) => {
	return ses.sendEmail(email);
};

export default sendEmail;
