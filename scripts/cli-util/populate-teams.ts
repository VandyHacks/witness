import { select } from '@inquirer/prompts';
import User from '../../models/user';
import Team from '../../models/team';
import { promptAction } from '../dev-cli';
import { faker } from '@faker-js/faker';

export const handlePopulateTeams = async () => {
	const choice = await select({
		message: 'Select team',
		choices: [
			{
				name: '⏪ Back',
				value: null,
			},
			{
				name: 'Create 10 teams (40 Hackers)',
				value: 'create-teams',
			},
		],
	});

	if (!choice) {
		return promptAction();
	}

	switch (choice) {
		case 'create-teams':
			await createTeams();
			break;
		default:
			return promptAction();
	}
};

const createTeams = async () => {
	for (let i = 0; i < 10; ++i) {
		const teamName = `${faker.commerce.productAdjective()} ${faker.commerce.productAdjective()} ${faker.commerce.product()}`;

		if (await Team.find({ name: teamName })) {
			--i;
			continue;
		}

		const team = new Team({
			name: teamName,
			members: [],
			devpost: `https://devpost.com/${faker.random.alphaNumeric(6)}`,
			joinCode: `test join code: ${faker.random.alphaNumeric(6)}`,
		});
		await team.save();
		for (let j = 0; j < 4; ++j) {
			const name = `${faker.name.firstName()} ${faker.name.lastName()}`;
			const email = faker.internet.email();
			const user = new User({
				name,
				email,
				team: team._id,
				userType: 'HACKER',
			});
			await user.save();
		}
	}
	console.log('Done!');
};
