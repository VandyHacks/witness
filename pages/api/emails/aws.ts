var AWS = require('aws-sdk');
import { ApplicationStatus } from '../../../types/database';
import { UserData } from '../../../types/database';
import submitted from './templates/submitted';
import accepted from './templates/accepted';
import confirmed from './templates/confirmed';
import rejected from './templates/rejected';
import logger from '../logger';

const AWS_REGION = process.env.AWS_Region as string;

if (AWS_REGION == null) {
	throw new Error('AWS_REGION not set');
}

AWS.config.update({ region: AWS_REGION });

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

export function sendStatusEmail(user: UserData, status: ApplicationStatus): void {
	/* Commenting out for now, no unsubscribed functionality yet
    if (user.emailUnsubscribed) {
		logger.info(`Skipping email to unsubscribed user`, user);
	}
    */

	let email: AWS.SES.SendEmailRequest;
	switch (status) {
		case ApplicationStatus.SUBMITTED:
			email = submitted(user);
			break;
		case ApplicationStatus.ACCEPTED:
			email = accepted(user);
			break;
		case ApplicationStatus.CONFIRMED:
			email = confirmed(user);
			break;
		case ApplicationStatus.REJECTED:
			email = rejected(user);
			break;
		default:
			throw new Error(`Unimplemented email for status "${status}" to user "${user.email}`);
	}

	ses
		.sendEmail(email)
		.promise()
		.then((data: any) => logger.info(`email submitted to SES for ${user.email}`, data))
		.catch(logger.error);
}

// eslint-disable-next-line import/no-anonymous-default-export
export default { sendStatusEmail };
