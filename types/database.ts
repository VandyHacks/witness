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

export enum ApplicationStatus {
	CREATED,
	DECLINED,
	STARTED,
	SUBMITTED,
	ACCEPTED,
	CONFIRMED,
	REJECTED,
}

export interface UserData {
	_id: mongoose.Schema.Types.ObjectId;
	name: string;
	email: string;
	image: string;
	userType: string;
	team?: mongoose.Schema.Types.ObjectId;
	applicationStatus: ApplicationStatus;
}

export interface PreAddData {
	_id: mongoose.Schema.Types.ObjectId;
	name: string;
	email: string;
	userType: string;
	note: string;
	addedBy: string;
	status: string;
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

enum Gender {
	Male,
	Female,
}
export interface ApplicationData {
	_id: mongoose.Schema.Types.ObjectId;
	firstName: string;
	lastName: string;
	gender: Gender;
	dietaryRestriction: Array<string>;
	phoneNumber: string;
	dateOfBirth: string;
	school: string;
	major: string;
	graduationYear: string;
	race: Array<string>;
	motivation: Array<string>;
	attendingInPerson: boolean;
	volunteer: boolean;
	address1: string;
	city: string;
	state: string;
	zip: number;
	shirtSize: string;
	user: {
		applicationStatus: ApplicationStatus;
	};
	status: string;
}
