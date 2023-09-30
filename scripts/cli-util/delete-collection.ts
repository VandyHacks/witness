import { input, select } from '@inquirer/prompts';
import dbConnect from '../../middleware/database';
import User from '../../models/user';
import Team from '../../models/team';
import Scores from '../../models/scores';
import Schedule from '../../models/schedule';
import JudgingSession from '../../models/JudgingSession';
import { promptAction } from '../dev-cli';
import { UserData, TeamData } from '../../types/database';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

export const handleDeleteCollection = async () => {
	await dbConnect(process.env.DATABASE_URL);

	let del = true;

	const firstConf = await select({
		message: 'You will be deleting: Hackers, Teams, Scores, Schedule, Judging Sessions',
		choices: [
			{
				name: 'Yes',
				value: 'yes',
			},
			{
				name: 'No',
				value: 'no',
			},
		],
	});

	if (firstConf === 'no') {
		del = false;
		return promptAction();
	}

	const secondConf = await select({
		message: 'Are you sure?',
		choices: [
			{
				name: 'Yes',
				value: 'yes',
			},
			{
				name: 'No',
				value: 'no',
			},
		],
	});

	if (secondConf === 'no') {
		del = false;
		return promptAction();
	}

	const thirdConf = await select({
		message:
			"You are about delete all of these collections: 'Hackers', 'Teams', 'Scores', 'Schedule', 'Judging Sessions'",
		choices: [
			{
				name: 'Yes',
				value: 'yes',
			},
			{
				name: 'No',
				value: 'no',
			},
		],
	});

	if (thirdConf === 'no') {
		del = false;
		return promptAction();
	}

	if (del) {
		await User.deleteMany({ userType: 'HACKER' });
		await Team.deleteMany({});
		await Scores.deleteMany({});
		await Schedule.deleteMany({});
		await JudgingSession.deleteMany({});
		console.log('Deleted all collections');
		return promptAction();
	}
};
