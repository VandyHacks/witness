export interface Team {
	members: string[];
	projectName: string;
	devpostURL: URL;
}

export interface JudgingData {
	time: number;
	team: Team;
	judges: string[];
	zoomURL: URL;
}




//New Interfaces

import mongoose from 'mongoose';

export interface Users {
	_id: mongoose.Schema.Types.ObjectId,
	name: string,
	email: string,
	image: string,
	userType: string,
	team: mongoose.Schema.Types.ObjectId
}

export interface Teams {
	_id: mongoose.Schema.Types.ObjectId,
	name: string,
	joinCode: string,
	devpost: string,
	members: Users[],
	scores: mongoose.Schema.Types.ObjectId[]
}

export interface Scores {
	_id: mongoose.Schema.Types.ObjectId,
	team: mongoose.Schema.Types.ObjectId,
	judge: mongoose.Schema.Types.ObjectId,
	technicalAbility: number,
	creativity: number,
	utility: number,
	presentation: number,
	wowfactor: number,
	comments: string,
	feedback: string
}

export interface Schedules {
	_id: mongoose.Schema.Types.ObjectId,
	team: mongoose.Schema.Types.ObjectId,
	judges: mongoose.Schema.Types.ObjectId[],
	zoom: string,
	time: number
}


