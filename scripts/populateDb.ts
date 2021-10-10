import faker from 'faker';
const { ObjectID } = require('mongodb');
import mongoose from 'mongoose';
import type { UserData, TeamData, ScoreData, ScheduleData } from '../types/database';
import { config as dotenvConfig } from 'dotenv';
import dbConnect from '../middleware/database';

import User from '../models/user';
import Team from '../models/team';
import Score from '../models/scores';
import Schedule from '../models/schedule';

dotenvConfig();

const { NUM_HACKERS, NUM_JUDGES, JUDGING_LENGTH, NUM_ROOMS, START_TIME_STAMP, EMAIL, USER_TYPE } = process.env;

if (!(NUM_HACKERS && NUM_JUDGES && JUDGING_LENGTH && NUM_ROOMS && START_TIME_STAMP && EMAIL && USER_TYPE)) {
	console.log('Usage:');
	console.log(
		'Please log into Witness using a fresh database. Then, make sure that the following variables are set in your .env:'
	);
	console.log('NUM_HACKERS: integer number of hackers to generate');
	console.log('NUM_JUDGES: integer number of judges to generate');
	console.log('NUM_ROOMS: integer number of zoom rooms URLs to generate');
	console.log('JUDGING_LENGTH: length in milliseconds of a judging period');
	console.log('START_TIME_STAMP: unix timestamp for when "judging" will begin');
	console.log('EMAIL: email address (case sensitive) of the user you signed in as in the first step.');
	console.log(
		'USER_TYPE: one of JUDGE or HACKER or ORGANIZER. Set this to whatever you want your user to be assigned as.'
	);
	console.log('================================================================');
	console.log(
		'Run the script with DATABASE_URL="..." ts-node <path-to-script>/populateDb.ts where ... is your DEVELOPMENT database connection string.'
	);
	process.exit(0);
}
function generateUser(userType: string): UserData {
	return {
		_id: new ObjectID(),
		name: faker.name.findName(),
		email: faker.internet.email(),
		image: faker.image.image(),
		userType: userType,
	};
}

function generateTeam(members: mongoose.Schema.Types.ObjectId[]): TeamData {
	return {
		_id: new ObjectID(),
		name: `${faker.commerce.productName()} ${faker.commerce.productName()}`,
		joinCode: faker.datatype.uuid(),
		devpost: `https://devpost.com/${faker.datatype.string()}`,
		members: members,
		scores: [],
	};
}

function generateScore(team: mongoose.Schema.Types.ObjectId, judge: mongoose.Schema.Types.ObjectId): ScoreData {
	return {
		_id: new ObjectID(),
		team: team,
		judge: judge,
		technicalAbility: faker.datatype.number(7),
		creativity: faker.datatype.number(7),
		utility: faker.datatype.number(7),
		presentation: faker.datatype.number(7),
		wowFactor: faker.datatype.number(7),
		comments: faker.lorem.sentence(),
		feedback: faker.lorem.sentence(),
	};
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

	const you = await User.findOneAndUpdate({ email: EMAIL }, { userType: USER_TYPE });
	if (!you) {
		console.error('Provided user email does not exist in database. Make sure you log in first.');
		process.exit(0);
	}
	// make all judges and hackers
	console.log('Generating hackers and judges...');
	const judges = Array(parseInt(NUM_JUDGES || '0') - 1)
		.fill(null)
		.map(_ => generateUser('JUDGE'));

	// include yourself as a judge
	if (USER_TYPE === 'JUDGE') {
		judges.splice(0, 1);
		judges.push(you);
	}
	const hackers = Array(parseInt(NUM_HACKERS || '0'))
		.fill(null)
		.map(_ => generateUser('HACKER'));
	if (USER_TYPE === 'HACKER') {
		hackers.splice(0, 1);
		hackers.push(you);
	}
	// run team matching
	console.log('Putting hackers into teams...');
	const teams = [];
	const hackersCopy = hackers.slice();
	while (hackersCopy.length > 0) {
		const members = hackersCopy.splice(0, Math.floor(Math.random() * 4 + 1));
		const team = generateTeam(members.map(member => member._id));
		members.forEach(member => (member.team = team._id));
		teams.push(team);
	}
	console.log('Creating schedule...');
	// Get zoom rooms (this is actually how it'll be done in prod too)
	const rooms = Array(parseInt(NUM_ROOMS || '0'))
		.fill(null)
		.map((_, i) => `https://vhl.ink/room-${i + 1}`);
	// Fill schedule
	const schedule: ScheduleData[] = [];
	const teamsCopy = teams.slice();
	let timestamp = parseInt(START_TIME_STAMP || '0');
	while (teamsCopy.length > 0) {
		let teamsInThisTimeSlot = Math.floor(1 + Math.random() * 5);
		if (teamsInThisTimeSlot > teamsCopy.length) teamsInThisTimeSlot = teamsCopy.length;
		for (let i = 0; i < teamsInThisTimeSlot; i++) {
			const judgesCopy = judges.slice();
			const team = teamsCopy.pop() as TeamData;
			schedule.push({
				_id: new ObjectID(),
				team: team._id,
				// Takes a random subset of judges (without replacement)
				judges: Array(3)
					.fill(null)
					.map(_ => judgesCopy.splice(Math.floor(Math.random() * judgesCopy.length), 1)[0]._id),
				zoom: rooms[i],
				time: new Date(timestamp),
			});
		}
		timestamp += parseInt(JUDGING_LENGTH || '0');
	}

	// Generate scores
	console.log('Scoring...');
	const scores = schedule.flatMap(item => item.judges.map(judge => generateScore(item.team, judge)));

	console.log('Inserting teams...');
	let teamsCount = (await Team.insertMany(teams)).length;
	console.log('Inserting users...');
	if (USER_TYPE === 'HACKER') hackers.splice(hackers.length - 1);
	else if (USER_TYPE === 'JUDGE') judges.splice(judges.length - 1);
	let usersCount = (await User.insertMany(hackers)).length + (await User.insertMany(judges)).length;
	console.log('Inserting scores...');
	let scoresCount = (await Score.insertMany(scores)).length;
	console.log('Inserting schedule...');
	let schedulesCount = (await Schedule.insertMany(schedule)).length;

	console.log('==========DONE==========');
	console.log(`Teams: ${teamsCount}`);
	console.log(`Users: ${usersCount}`);
	console.log(`Scores: ${scoresCount}`);
	console.log(`Schedules: ${schedulesCount}`);

	process.exit(0);
}

populateDatabase();
