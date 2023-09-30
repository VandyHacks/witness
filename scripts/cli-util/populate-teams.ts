import { input, select } from '@inquirer/prompts';
import dbConnect from '../../middleware/database';
import User from '../../models/user';
import Team from '../../models/team';
import { promptAction } from '../dev-cli';
import { UserData, TeamData } from '../../types/database';
import * as dotenv from 'dotenv';
dotenv.config();

export const handlePopulateTeams = async () => {
	const numTeams = await input({
		message: 'Enter number of teams to create',
	});

	const numHackers = await input({
		message: 'Enter number of hackers to create',
	});

	// connect to db
	await dbConnect(process.env.DATABASE_URL);
};
