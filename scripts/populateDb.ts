const faker = require('faker');
const { ObjectID } = require('mongodb');
import mongoose, { AnyKeys } from 'mongoose';
import type {Users, Teams, Scores, Schedules} from "../types/types"
import dbConnect from '../middleware/database';

import User from "../models/user";
import Team from "../models/team";
import Score from "../models/scores";
import Schedule from "../models/schedule";

function generateUsers(team: mongoose.Schema.Types.ObjectId, userType: string) : Users {

    return {
        _id: new ObjectID(),
        name: faker.name.findName(),
        email: faker.internet.email(),
        image: faker.image.image(),
        userType: userType,
        team: team,
    }
}

function generateTeams() : Teams {

    return {
        _id: new ObjectID(),
        name: faker.company.companyName(),
        joinCode: faker.datatype.uuid(),
        devpost: `https://devpost.com/${faker.datatype.string()}`,
        members: [],
        scores: []
    }

}

function generateScores(team: mongoose.Schema.Types.ObjectId, judge: mongoose.Schema.Types.ObjectId) : Scores {

    return {
    _id: new ObjectID(),
    team: team,
    judge: judge,
    technicalAbility: faker.datatype.number(7),
    creativity: faker.datatype.number(7),
    utility: faker.datatype.number(7),
    presentation: faker.datatype.number(7),
    wowfactor: faker.datatype.number(7),
    comments: faker.lorem.sentence(),
    feedback: faker.lorem.sentence(),
    }
}

function generateSchedules(team: mongoose.Schema.Types.ObjectId, judges: mongoose.Schema.Types.ObjectId[]) : Schedules {

    return {
        _id: new ObjectID(),
        team: team,
        judges: judges,
        zoom: faker.internet.url(),
        time: new Date().getTime(),
    }

}

const populateDatabase = async (): Promise<void> => {

    const newTeams: Teams[] = [];
    const newUsers: Users[] = [];
    const newScores: Scores[] = [];
    const newSchedules: Schedules[] = [];

    for ( let i = 0; i < 10; i++){
        let nextTeam = generateTeams();
        let teamUsers: Users[] = [];
        let teamJudges: mongoose.Schema.Types.ObjectId[] = [];
        let teamScores: mongoose.Schema.Types.ObjectId[] = [];
        for (let j = -2; j < faker.datatype.number(2); j++){
            let nextUser = generateUsers(nextTeam._id, "HACKER");
            teamUsers.push(nextUser)
            newUsers.push(nextUser);
        }

        nextTeam.members = teamUsers;

        for (let k = 0; k < 3; k++){
            let nextJudge = generateUsers(nextTeam._id, "JUDGE");
            newUsers.push(nextJudge);
            teamJudges.push(nextJudge._id);

            let nextScore = generateScores(nextTeam._id, nextJudge._id);
            newScores.push(nextScore);
            teamScores.push(nextScore._id);
        }

        nextTeam.scores = teamScores;
        let nextSchedule = generateSchedules(nextTeam._id, teamJudges);
        newSchedules.push(nextSchedule)
        newTeams.push(nextTeam);
    }

    console.log(newTeams);
    console.log(newUsers);
    console.log(newScores);
    console.log(newSchedules);

    await dbConnect();

    let teamsCount = await Team.insertMany(newTeams);
    let usersCount = await User.insertMany(newUsers);
    let scoresCount = await Score.insertMany(newScores);
    let schedulesCount = await Schedule.insertMany(newSchedules);

    console.log(`Teams: ${teamsCount}, Users: ${usersCount},
                 Scores: ${scoresCount}, Schedules: ${schedulesCount}`)
    process.exit(0);
}


populateDatabase();