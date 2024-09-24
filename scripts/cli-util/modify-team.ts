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
		choices: [
			{
				name: '⏪ Back',
				value: null,
			},
			...teams.map((team, index) => ({
				name: `${index + 1}) ${team.name}`,
				value: team,
			})),
		],
	});

	if (!team) {
		return promptAction();
	}

	const subAction2 = await select({
		message: `Select an action to perform for team ${team.name}`,
		choices: [
			{
				name: 'Change Team Name',
				value: 'change-name',
			},
			// {
			// 	name: 'Remove a member',
			// 	value: 'remove-member',
			// },
			// {
			// 	name: 'Add a member',
			// 	value: 'add-member',
			// },
			// {
			// 	name: 'Change invite code',
			// 	value: 'change-invite-code',
			// },
			{
				name: 'Change devpost link',
				value: 'change-devpost-link',
			},
			{
				name: '⏪ Back',
				value: null,
			},
		],
	});

	switch (subAction2) {
		case 'change-name':
			await changeName(team);
			break;
		// case 'remove-member':
		// 	await removeMember(team);
		// 	break;
		// case 'add-member':
		// 	await addMember(team);
		// 	break;
		// case 'change-invite-code':
		// 	await changeInviteCode(team);
		// 	break;
		case 'change-devpost-link':
			await changeDevpostLink(team);
			break;
		default:
			await promptAction();
	}
};

const changeName = async (team: TeamData) => {
	const newName = await input({
		message: `Enter new team name for ${team.name}`,
	});

	await Team.updateOne({ _id: team._id }, { name: newName });

	console.log('Name changed successfully');
	return promptAction();
};

// const removeMember = async (team: TeamData) => {
// 	const memberIds = team.members;

// 	if (memberIds.length === 0) {
// 		console.log('Team has no members');
// 		return promptAction();
// 	}

// 	const members: UserData[] = await User.find({ _id: { $in: memberIds } });

// 	const member = await select({
// 		message: `Select member to remove from ${team.name}`,
// 		choices: [
// 			{
// 				name: '⏪ Back',
// 				value: null,
// 			},
// 			...members.map((mem, index) => ({
// 				name: `${index + 1}) ${mem.name}`,
// 				value: mem._id,
// 			})),
// 		],
// 	});

// 	if (!member) {
// 		return promptAction();
// 	}

// 	await Team.updateOne({ _id: team._id }, { $pull: { members: member } });

// 	console.log(`Member [${member}] removed from team [${team.name}]`);
// 	return promptAction();
// };

// const addMember = async (team: TeamData) => {
// 	const memberIds = team.members;

// 	const members: UserData[] = await User.find({ _id: { $nin: memberIds }, team: null });

// 	const member = await select({
// 		message: `Select member to add to ${team.name}`,
// 		choices: [
// 			{
// 				name: '⏪ Back',
// 				value: null,
// 			},
// 			...members.map((mem, index) => ({
// 				name: `${index}) ${mem.name}`,
// 				value: mem._id,
// 			})),
// 		],
// 	});

// 	if (!member) {
// 		return promptAction();
// 	}

// 	await Team.updateOne({ _id: team._id }, { $push: { members: member } });

// 	console.log(`Member [${member}] added to team [${team.name}]`);
// 	return promptAction();
// };

// const changeInviteCode = async (team: TeamData) => {
// 	const newInviteCode = await input({
// 		message: `Enter new invite code for ${team.name}`,
// 	});

// 	await Team.updateOne({ _id: team._id }, { joinCode: newInviteCode });

// 	console.log('Invite code changed successfully');
// 	return promptAction();
// };

const changeDevpostLink = async (team: TeamData) => {
	const newDevpostLink = await input({
		message: `Enter new devpost link for ${team.name}`,
	});

	// link has to have host devpost.com
	const check = new URL(newDevpostLink);
	const allowedHosts = ['devpost.com', 'www.devpost.com'];
	if (!allowedHosts.includes(check.host)) {
		console.log('Invalid devpost link');
		return promptAction();
	}

	await Team.updateOne({ _id: team._id }, { devpost: newDevpostLink });

	console.log('Devpost link changed successfully');
	return promptAction();
};
