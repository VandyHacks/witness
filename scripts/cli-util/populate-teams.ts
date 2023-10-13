import { input, select } from '@inquirer/prompts';
import User from '../../models/user';
import Team from '../../models/team';
import { promptAction } from '../dev-cli';
import { UserData, TeamData } from '../../types/database';

export const handlePopulateTeams = async () => {
	const numTeams = await input({
		message: 'Enter number of teams to create',
	});

	const numHackers = await input({
		message: 'Enter number of hackers to create',
	});

	// TODO: gabe
};
