import { input, select } from '@inquirer/prompts';
import dbConnect from '../../middleware/database';

// TODO: zi
/**
 * Quickly change the application status of hacker.
 * A hacker has multiple application statuses.
 */
export const handleModifyHacker = async () => {
	// get hacker email
	const hackerEmail = await input({
		message: 'Enter hacker email',
	});

	// get sub-action
	const subAction1 = await select({
		message: 'Select sub-action to perform',
		choices: [
			{
				name: 'Change application status',
				value: 'change-status',
			},
			{
				name: 'Delete application',
				value: 'delete-application',
			},
			{
				name: 'Join a team',
				value: 'join-team',
			},
			{
				name: 'Leave team',
				value: 'leave-team',
			},
			{
				name: 'NFC check-in',
				value: 'nfc-check-in',
			},
		],
	});

	// perf
	switch (subAction1) {
		case 'change-status':
			break;
		case 'delete-application':
			break;
		case 'join-team':
			break;
		case 'leave-team':
			break;
		case 'nfc-check-in':
			break;
	}
};

const changeStatus = async () => {
	const newStatus = await select({
		message: 'Select new status',
		choices: [
			{
				name: 'Change application status to CREATED',
				value: 'created',
			},
			{
				name: 'Change application status to DECLINED',
				value: 'declined',
			},
			{
				name: 'Change application status to SUBMITTED',
				value: 'submitted',
			},
			{
				name: 'Change application status to ACCEPTED',
				value: 'accepted',
			},
			{
				name: 'Change application status to CONFIRMED',
				value: 'confirmed',
			},
			{
				name: 'Change application status to REJECTED',
				value: 'rejected',
			},
			{
				name: 'Change application status to CHECKED_IN',
				value: 'checked-in',
			},
		],
	});

	//
	await dbConnect();
};

const deleteApplication = async () => {};

const joinTeam = async () => {};

const leaveTeam = async () => {};

const nfcCheckIn = async () => {};
