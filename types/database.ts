import { Dayjs } from 'dayjs';
import mongoose from 'mongoose';

export const enum ApplicationStatus {
	CREATED,
	DECLINED,
	STARTED,
	SUBMITTED,
	ACCEPTED,
	CONFIRMED,
	REJECTED,
	CHECKED_IN,
}

export interface ApplicationData {
	_id: mongoose.Schema.Types.ObjectId;
	firstName: string;
	preferredName: string;
	lastName: string;
	gender: string;
	dietaryRestrictions: string[];
	accomodationNeeds: string;
	phoneNumber: string;
	dateOfBirth: string;
	school: string;
	major: string;
	yearOfStudy: string;
	race: string[];
	motivation: string[];
	applyTravelReimbursement: boolean;
	volunteer: boolean;
	address1: string;
	address2: string;
	city: string;
	state: string;
	zip: string;
	country: string;
	shirtSize: string;
	mlhComms: boolean;
}

export interface UserData {
	_id: mongoose.Schema.Types.ObjectId;
	name: string;
	email: string;
	image: string;
	userType: string;
	team?: mongoose.Schema.Types.ObjectId;
	application?: mongoose.Schema.Types.ObjectId;
	applicationStatus: ApplicationStatus;
	eventsAttended: mongoose.Schema.Types.ObjectId[];
	isJudgeCheckedIn?: boolean;
	settings?: {
		baseTheme?: string;
		accentColor?: string;
	};
	nfcPoints: number;
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
	locationNum?: number;
	createdAt: Date;
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

export interface EventData {
	_id: mongoose.Schema.Types.ObjectId;
	name: String;
	description: String;
	startTime: String;
	endTime: String;
	location: String;
	nfcPoints: Number;
}

export interface EventCountData {
	_id: mongoose.Schema.Types.ObjectId;
	count: number;
}

export interface JudgingSessionData {
	_id?: mongoose.Schema.Types.ObjectId;
	team: TeamData;
	judge: UserData;
	time: String;
}

export interface HackathonSettingsData {
	_id: mongoose.Schema.Types.ObjectId;
	HACKATHON_START: string; // MM/DD/YYYY HH:mm A
	HACKATHON_END: string; // MM/DD/YYYY hh:mm A
	JUDGING_START: string; // MM/DD/YYYY hh:mm A
	JUDGING_END: string; // MM/DD/YYYY hh:mm A
	ON_CALL_DEV: string;
}
