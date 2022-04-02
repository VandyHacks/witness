import { faker } from '@faker-js/faker';
const { ObjectID } = require('mongodb');
import mongoose from 'mongoose';
import type { UserData, TeamData, ScoreData, ScheduleData } from '../types/database';
import { config as dotenvConfig } from 'dotenv';
import dbConnect from '../middleware/database';

import User from '../models/user';
import Team from '../models/team';
import Score from '../models/scores';
import Schedule from '../models/schedule';

import { parse } from 'ts-command-line-args';

dotenvConfig();

interface Arguments {
	numHackers?: number;
	numJudges?: number;
	judgingLength?: number;
	numRooms?: number;
	startTimeStamp?: number;
	email?: string;
	userType?: string;
	databaseUrl: string;
	help?: boolean;
}

export const args = {
	// Defaults
	...{
		numHackers: 500,
		numJudges: 20,
		judgingLength: 10 * 1000,
		numRooms: 5,
		startTimeStamp: Date.now() + 60 * 1000,
	},
	...parse<Arguments>(
		{
			databaseUrl: { type: String, alias: 'D', description: '***REQUIRED***: Database connection string' },
			numHackers: {
				type: Number,
				alias: 'H',
				optional: true,
				description: 'Number of hackers to generate (default 500)',
			},
			numJudges: {
				type: Number,
				alias: 'J',
				optional: true,
				description: 'Number of judges to generate (default 20)',
			},
			judgingLength: {
				type: Number,
				alias: 'L',
				optional: true,
				description: 'Length of judging period in milliseconds (default 10 seconds)',
			},
			numRooms: {
				type: Number,
				alias: 'R',
				optional: true,
				description: 'Number of zoom rooms to generate (default 5)',
			},
			startTimeStamp: {
				type: Number,
				alias: 'S',
				optional: true,
				description: 'Unix timestamp (in milliseconds) for when judging will begin (default 1 minute from now)',
			},
			email: {
				type: String,
				alias: 'E',
				optional: true,
				description: 'Your email address (only if you want to be included in judging, default none).',
			},
			userType: {
				type: String,
				alias: 'U',
				optional: true,
				description: 'Your user type (only if you want to be included in judging, default none).',
			},
			help: { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' },
		},
		{
			helpArg: 'help',
			headerContentSections: [{ header: 'Populate DB Config', content: 'Populates the database with fake data' }],
		}
	),
};

// TODO: test
if ((args.email === undefined) !== (args.userType === undefined)) {
	console.error('You must provide both an email and user type if you want to be included in judging.');
	process.exit(1);
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
		await dbConnect(args.databaseUrl);
	} catch (e) {
		console.error(
			'Error connecting to database. Make sure you specify the DATABASE_URL env variable when you run the script.'
		);
	}

	const you =
		args.email !== undefined
			? await User.findOneAndUpdate({ email: args.email }, { userType: args.userType })
			: null;
	// make all judges and hackers
	console.log('Generating hackers and judges...');
	const judges = Array(args.numJudges - 1)
		.fill(null)
		.map(_ => generateUser('JUDGE'));

	// include yourself as a judge
	if (args.userType === 'JUDGE') {
		judges.splice(0, 1);
		judges.push(you);
	}
	const hackers = Array(args.numHackers)
		.fill(null)
		.map(_ => generateUser('HACKER'));
	if (args.userType === 'HACKER') {
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
	const rooms = Array(args.numRooms)
		.fill(null)
		.map((_, i) => `https://vhl.ink/room-${i + 1}`);
	// Fill schedule
	const schedule: ScheduleData[] = [];
	const teamsCopy = teams.slice();
	let timestamp = args.startTimeStamp;
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
		timestamp += args.judgingLength;
	}

	// Generate scores
	console.log('Scoring...');
	const scores = schedule.flatMap(item => item.judges.map(judge => generateScore(item.team, judge)));

	console.log('Inserting teams...');
	let teamsCount = (await Team.insertMany(teams)).length;
	console.log('Inserting users...');
	if (args.userType === 'HACKER') hackers.splice(hackers.length - 1);
	else if (args.userType === 'JUDGE') judges.splice(judges.length - 1);
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
