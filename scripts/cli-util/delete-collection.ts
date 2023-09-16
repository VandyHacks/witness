import { input, select } from '@inquirer/prompts';
import dbConnect from '../../middleware/database';
import User from '../../models/user';
import Team from '../../models/team';
import { promptAction } from '../dev-cli';
import { UserData, TeamData } from '../../types/database';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

export const handleDeleteCollection = async () => {
	await dbConnect(process.env.DATABASE_URL);
	const db = mongoose.connection.db;

	const collections = await db.listCollections().toArray();
	console.log(collections);

	const collectionNames = collections.map(collection => collection.name);

	const choices = collectionNames.map(collectionName => ({
		name: collectionName,
		value: collectionName,
	}));

	const collectionName = await select({
		message: 'Select collection to delete',
		choices: choices,
	});
};

handleDeleteCollection();
