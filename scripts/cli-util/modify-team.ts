import { input, select } from '@inquirer/prompts';
import { promptAction } from '../dev-cli';
import User from '../../models/user';
import Team from '../../models/team';
import { UserData, TeamData } from '../../types/database';

export const handleModifyTeam = async () => {
	const teams: TeamData[] | null = await Team.find();

	if (!teams) {
		console.log('team not found');
		return promptAction();
	}

	const team = await select({
		message: 'Select team',
		choices: teams.map(team => ({
			name: team.name,
			value: team,
		})),
	});

	const subAction2 = await select({
		message: 'Select an action to perform',
		choices: [
			{
				name: 'Change Team Name',
				value: 'change-name',
			},
			{
				name: 'Remove a member',
				value: 'remove-member',
			},
			{
				name: 'Add a member',
				value: 'add-member',
			},
			{
				name: 'Change invite code',
				value: 'change-invite-code',
			},
			{
				name: 'Change-devpost-link',
				value: 'change-devpost-link',
			},
		],
	});

	switch (subAction2) {
		case 'change-name':
			await changeName(team);
			break;
		case 'remove-member':
			await removeMember(team);
			break;
		case 'add-member':
			await addMember(team);
			break;
		case 'change-invite-code':
			await changeInviteCode(team);
			break;
		case 'change-devpost-link':
			await changeDevpostLink(team);
			break;
		default:
			console.log('Invalid action');
	}
};

const changeName = async (team: TeamData) => {
	const newName = await input({
		message: 'Enter new name',
	});

	await Team.updateOne({ _id: team._id }, { name: newName });

	console.log('Name changed successfully');
	return promptAction();
};

const removeMember = async (team: TeamData) => {
	const memberIds = team.members;

	if (memberIds.length === 0) {
		console.log('Team has no members');
		return promptAction();
	}

	const members: UserData[] = await User.find({ _id: { $in: memberIds } });

	const member = await select({
		message: 'Select member to remove',
		choices: members.map(mem => ({
			name: mem.name,
			value: mem._id,
		})),
	});

	await Team.updateOne({ _id: team._id }, { $pull: { members: member } });

	console.log('Member removed');
	return promptAction();
};

const addMember = async (team: TeamData) => {
	const memberIds = team.members;

	const members: UserData[] = await User.find({ _id: { $nin: memberIds }, team: null });

	const member = await select({
		message: 'Select member to add',
		choices: members.map(mem => ({
			name: mem.name,
			value: mem._id,
		})),
	});

	await Team.updateOne({ _id: team._id }, { $push: { members: member } });

	console.log('Member added');
	return promptAction();
};

const changeInviteCode = async (team: TeamData) => {
	const newInviteCode = await input({
		message: 'Enter new invite code',
	});

	await Team.updateOne({ _id: team._id }, { joinCode: newInviteCode });

	console.log('Invite code changed successfully');
	return promptAction();
};

const changeDevpostLink = async (team: TeamData) => {
	const newDevpostLink = await input({
		message: 'Enter new devpost link',
	});

	await Team.updateOne({ _id: team._id }, { devpost: newDevpostLink });

	console.log('Devpost link changed successfully');
	return promptAction();
};
