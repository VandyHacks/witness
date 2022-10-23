import { faker } from '@faker-js/faker';
const { ObjectID } = require('mongodb');
import mongoose from 'mongoose';
import { UserData, TeamData, ScoreData, JudgingSessionData, ApplicationStatus } from '../types/database';
import { config as dotenvConfig } from 'dotenv';
import dbConnect from '../middleware/database';

import User from '../models/user';
import Team from '../models/team';
import Score from '../models/scores';
import JudgingSession from '../models/JudgingSession';

import { parse } from 'ts-command-line-args';
import { ConsoleSqlOutlined } from '@ant-design/icons';

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
		numHackers: 56,
		numJudges: 13,
		judgingLength: 10 * 1000 * 60, // 10 min
		numRooms: 5,
		startTimeStamp: new Date('2022-10-23T10:00:00').getTime(), // Start time 
		userType: 'HACKER',
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
				description: 'Your user type (only if you want to be included in judging, default HACKER).',
			},
			help: { type: Boolean, optional: true, alias: 'h', description: 'Prints this usage guide' },
		},
		{
			helpArg: 'help',
			headerContentSections: [{ header: 'Populate DB Config', content: 'Populates the database with fake data' }],
		}
	),
};

function generateUser(userType: string): UserData {
	return {
		_id: new ObjectID(),
		name: faker.name.findName(),
		email: faker.internet.email(),
		image: faker.image.image(),
		userType: userType,
		applicationStatus: ApplicationStatus.CREATED,
	};
}

function generateTeam(members: mongoose.Schema.Types.ObjectId[], devPostIncrement: number): TeamData {
	return {
		_id: new ObjectID(),
		name: `${faker.commerce.productName()} ${faker.commerce.productName()}`,
		joinCode: faker.datatype.uuid(),
		devpost: `https://devpost.com/${devPostIncrement}`,
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
	let devPostIncrement = 0;
	while (hackersCopy.length > 0) {
		const members = hackersCopy.splice(0, Math.floor((Math.random() * 4) + 1));
		if (members[0] === null) {
			break;
		}
		console.log(members);
		const team = generateTeam(members.map(member => member._id), devPostIncrement);
		devPostIncrement = devPostIncrement + 1;
		members.forEach(member => (member.team = team._id));
		teams.push(team);
	}
	console.log('Creating judging sessions...');
	// Get zoom rooms (this is actually how it'll be done in prod too)
	// Fill 
	const judgingSessions: JudgingSessionData[] = [];
	const teamsCopy = teams.slice();
	let timestamp = args.startTimeStamp;
	while (teamsCopy.length > 0) {
		let teamsInThisTimeSlot = Math.floor(1 + Math.random() * 5);
		if (teamsInThisTimeSlot > teamsCopy.length) teamsInThisTimeSlot = teamsCopy.length;
		for (let i = 0; i < teamsInThisTimeSlot; i++) {
			const judgesCopy = judges.slice();
			const team = teamsCopy.pop() as TeamData;
			judgingSessions.push({
				_id: new ObjectID(),
				team,
				// Takes a random judge (without replacement)
				judge: judgesCopy[Math.floor(Math.random() * (judgesCopy.length))],
				time: (new Date(timestamp)).toISOString(),
			});
		}
		timestamp += args.judgingLength;
	}

	
	// Generate scores
	console.log('Scoring...');
	const scores = judgingSessions.map(item => generateScore(item.team._id, item.judge._id));
	 
	console.log('Inserting teams...');
	let teamsCount = (await Team.insertMany(teams)).length;
	console.log('Inserting users...');
	if (args.userType === 'HACKER') hackers.splice(hackers.length - 1);
	else if (args.userType === 'JUDGE') judges.splice(judges.length - 1);
	let usersCount = (await User.insertMany(hackers)).length + (await User.insertMany(judges)).length;
	console.log('Inserting scores...');
	let scoresCount = (await Score.insertMany(scores)).length;
	console.log('Inserting schedule...');
	let judgingSessionCount = (await JudgingSession.insertMany(judgingSessions)).length;

	console.log('==========DONE==========');
	console.log(`Teams: ${teamsCount}`);
	console.log(`Users: ${usersCount}`);
	console.log(`Scores: ${scoresCount}`);
	console.log(`JudgingSessions: ${judgingSessionCount}`);

	process.exit(0);
}

async function generateJudgingSessions() {
	console.log('Connecting to DB...');
	try {
		await dbConnect(args.databaseUrl);
	} catch (e) {
		console.error(
			'Error connecting to database. Make sure you specify the DATABASE_URL env variable when you run the script.'
		);
	}
	const judgingSessions: JudgingSessionData[] = [];
	const teamsCopy = await Team.find({});
	const allJudges = await User.find({userType: "JUDGE"});
	console.log(allJudges);
	let timestamp = args.startTimeStamp;
	while (teamsCopy.length > 0) {
		let teamsInThisTimeSlot = Math.floor(1 + Math.random() * 5);
		if (teamsInThisTimeSlot > teamsCopy.length) teamsInThisTimeSlot = teamsCopy.length;
		for (let i = 0; i < teamsInThisTimeSlot; i++) {
			const judgesCopy = allJudges.slice();
			const team = teamsCopy.pop() as TeamData;
			judgingSessions.push({
				_id: new ObjectID(),
				team,
				// Takes a random judge (without replacement)
				judge: judgesCopy[Math.floor(Math.random() * (judgesCopy.length))],
				time: (new Date(timestamp)).toISOString(),
			});
		}
		timestamp += args.judgingLength;
	}
	console.log('Inserting schedule...');
	let judgingSessionCount = (await JudgingSession.insertMany(judgingSessions)).length;
	process.exit(0);
}

//populateDatabase();
generateJudgingSessions();
