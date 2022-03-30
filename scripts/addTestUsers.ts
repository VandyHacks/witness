/*
add test users for dev builds to login w/ username/password and not oauth
*/

import { config as dotenvConfig } from 'dotenv';
import dbConnect from '../middleware/database';

import testUser from '../models/testUser';

dotenvConfig();

const { USERNAME, PASSWORD, EMAIL, USER_TYPE } = process.env;

if (!(USERNAME && PASSWORD && EMAIL && USER_TYPE)) {
	console.log('Usage:');
	console.log('Please log into Witness. Then, make sure that the following variables are set in your .env:');
	console.log('USERNAME: username for the test user');
	console.log('PASSWORD: password for the test user');
	console.log('EMAIL: fake email address to use for the test user');
	console.log(
		'USER_TYPE: one of JUDGE or HACKER or ORGANIZER. Set this to whatever you want your user to be assigned as.'
	);
	console.log('================================================================');
	console.log(
		'Run the script with DATABASE_URL="..." ts-node <path-to-script>/populateDb.ts where ... is your DEVELOPMENT database connection string.'
	);
	process.exit(0);
}

async function populateDatabase() {
	console.log('Connecting to DB...');
	try {
		await dbConnect();
	} catch (e) {
		console.error(
			'Error connecting to database. Make sure you specify the DATABASE_URL env variable when you run the script.'
		);
		console.error(e);
	}

	const user = new testUser({ username: USERNAME, password: PASSWORD, email: EMAIL, userType: USER_TYPE });
	await user.save();

	console.log('Test user created:', user);
	process.exit(0);
}

populateDatabase();
