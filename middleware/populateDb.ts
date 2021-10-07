const faker = require('faker');
import type {Users, Teams, Scores, Schedules} from "../types/types"
// import dbConnect from './database';


function generateUsers(team: Teams, userType: string) : Users {

    return {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        image: faker.image.image(),
        userType: userType,
        team: team,
    }
}

function generateTeams() : Teams {

    return {
        name: faker.company.companyName(),
        joinCode: faker.datatype.uuid(),
        devpost: `https://devpost.com/${faker.datatype.string()}`,
        members: [],
        scores: []
    }

}

function generateScores(team: Teams, judge: Users) : Scores {

    return {
    team: team,
    judge: judge,
    technicalAbility: faker.datatype.number(7),
    creativity: faker.datatype.number(7),
    utility: faker.datatype.number(7),
    presentation: faker.datatype.number(7),
    wowfactor: faker.datatype.number(7),
    comments: faker.datatype.number(7),
    feedback: faker.datatype.number(7),
    }
}

function generateSchedules(team: Teams, judges: Users[]) : Schedules {

    return {
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
        let teamJudges: Users[] = [];
        let teamScores: Scores[] = [];
        for (let j = -1; j < faker.datatype.number(3); j++){
            let nextUser = generateUsers(nextTeam, "HACKER");
            teamUsers.push(nextUser)
            newUsers.push(nextUser);
        }

        nextTeam.members = teamUsers;

        for (let k = -1; k < faker.datatype.number(2); k++){
            let nextJudge = generateUsers(nextTeam, "JUDGE");
            newUsers.push(nextJudge);
            teamJudges.push(nextJudge);

            let nextScore = generateScores(nextTeam, nextJudge);
            newScores.push(nextScore);
            teamScores.push(nextScore);
        }

        nextTeam.scores = teamScores;
        let nextSchedule = generateSchedules(nextTeam, teamJudges);
        newSchedules.push(nextSchedule)
        newTeams.push(nextTeam);
    }

    console.log(newTeams);
    console.log(newUsers);
    console.log(newScores);
    console.log(newSchedules);

    // let Db = await dbConnect();

    // let teamsCount = await Db.Teams.insertMany(newTeams);
    // let usersCount = await Db.Users.insertMany(newUsers);
    // let scoresCount = await Db.Scores.insertMany(newScores);
    // let schedulesCount = await Db.Schedules.insertMany(newSchedules);

    // console.log(`Teams: ${teamsCount}, Users: ${usersCount},
    //              Scores: ${scoresCount}, Schedules: ${schedulesCount}`)
}

populateDatabase();