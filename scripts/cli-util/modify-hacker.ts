import { input, select } from '@inquirer/prompts';
import User from '../../models/user';
import { promptAction } from '../dev-cli';
import { ApplicationStatus, UserData } from '../../types/database';

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

	// query for hacker document
	const hacker: UserData | null = await User.findOne({ email: hackerEmail });

	// if hacker not found, re-prompt
	if (!hacker) {
		console.log('Oops, Hacker not found! Please try again.');
		return promptAction();
	}

	// get sub-action
	const subAction = await select({
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

	// perform sub-action
	switch (subAction) {
		case 'change-status':
			await changeStatus(hacker);
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

const changeStatus = async (hacker: UserData) => {
	const oldStatus: ApplicationStatus = hacker.applicationStatus;

	// console.log(`Current status: ${Object.values(ApplicationStatus)[oldStatus]}`);

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

	// TODO:
};

const deleteApplication = async () => {};

const joinTeam = async () => {};

const leaveTeam = async () => {};

const nfcCheckIn = async () => {};
