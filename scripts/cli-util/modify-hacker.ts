import { input, select } from '@inquirer/prompts';
import User from '../../models/user';
import { promptAction } from '../dev-cli';
import { ApplicationStatus, UserData } from '../../types/database';
import Application from '../../models/application';

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
			await deleteApplication(hacker);
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
	// get old status
	const oldStatus: ApplicationStatus = hacker.applicationStatus;
	const oldStatusString = getApplicationStatusString(oldStatus);
	console.log(`Current status: ${oldStatus} (${oldStatusString})`);

	// query for new status
	const newStatus: ApplicationStatus = await select({
		message: 'Select new status',
		choices: [
			{
				name: 'Change application status to CREATED',
				value: ApplicationStatus.CREATED,
			},
			{
				name: 'Change application status to DECLINED',
				value: ApplicationStatus.DECLINED,
			},
			{
				name: 'Change application status to STARTED',
				value: ApplicationStatus.STARTED,
			},
			{
				name: 'Change application status to SUBMITTED',
				value: ApplicationStatus.SUBMITTED,
			},
			{
				name: 'Change application status to ACCEPTED',
				value: ApplicationStatus.ACCEPTED,
			},
			{
				name: 'Change application status to CONFIRMED',
				value: ApplicationStatus.CONFIRMED,
			},
			{
				name: 'Change application status to REJECTED',
				value: ApplicationStatus.REJECTED,
			},
			{
				name: 'Change application status to CHECKED_IN',
				value: ApplicationStatus.CHECKED_IN,
			},
		],
	});

	// update hacker document and log
	await User.updateOne({ email: hacker.email }, { applicationStatus: newStatus });
	console.log(`Changed application status from ${oldStatus} to ${newStatus}`);

	return promptAction();
};

const deleteApplication = async (hacker: UserData) => {
	// check if hacker has an application
	if (!hacker.application) {
		console.log('Hacker does not have an application');
		return;
	}

	// confirm deletion
	const confirm = await select({
		message: `Application Found! Are you sure you want to delete it (${hacker.application})?`,
		choices: [
			{
				name: 'Yes',
				value: true,
			},
			{
				name: 'No',
				value: false,
			},
		],
	});

	// cancel if not confirmed
	if (!confirm) {
		console.log('Cancelled');
		return promptAction();
	}

	// perform deletion and log
	await Application.deleteOne({ _id: hacker.application });
	await User.updateOne({ email: hacker.email }, { application: null });
	console.log('Deleted application successfully');

	return promptAction();
};

const joinTeam = async () => {};

const leaveTeam = async () => {};

const nfcCheckIn = async () => {};

const getApplicationStatusString = (status: ApplicationStatus): string => {
	switch (status) {
		case ApplicationStatus.CREATED:
			return 'CREATED';
		case ApplicationStatus.DECLINED:
			return 'DECLINED';
		case ApplicationStatus.STARTED:
			return 'STARTED';
		case ApplicationStatus.SUBMITTED:
			return 'SUBMITTED';
		case ApplicationStatus.ACCEPTED:
			return 'ACCEPTED';
		case ApplicationStatus.CONFIRMED:
			return 'CONFIRMED';
		case ApplicationStatus.REJECTED:
			return 'REJECTED';
		case ApplicationStatus.CHECKED_IN:
			return 'CHECKED_IN';
	}
};
