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

export interface UserData {
	_id: mongoose.Schema.Types.ObjectId;
	name: string;
	email: string;
	image: string;
	userType: string;
	team?: mongoose.Schema.Types.ObjectId;
}

export interface TeamData {
	_id: mongoose.Schema.Types.ObjectId;
	name: string;
	joinCode: string;
	devpost: string;
	members: mongoose.Schema.Types.ObjectId[];
	scores: mongoose.Schema.Types.ObjectId[];
}

export interface ScoreData {
	_id: mongoose.Schema.Types.ObjectId;
	team: mongoose.Schema.Types.ObjectId;
	judge: mongoose.Schema.Types.ObjectId;
	technicalAbility: number;
	creativity: number;
	utility: number;
	presentation: number;
	wowFactor: number;
	comments: string;
	feedback: string;
}

export interface ScheduleData {
	_id: mongoose.Schema.Types.ObjectId;
	team: mongoose.Schema.Types.ObjectId;
	judges: mongoose.Schema.Types.ObjectId[];
	zoom: string;
	time: Date;
}

export interface ResponseError extends Error {
	status?: number;
}
