export interface ScheduleDisplay {
	time: string;
	teamId: string;
	teamName: string;
	memberNames: string[];
	judgeNames: string[];
	devpost: string;
	zoom: string;
}

export interface OrganizerScheduleDisplay {
	time: string;
	teamId: string;
	teamName: string;
	memberNames: string[];
	judges: { name: string; id: string }[];
	devpost: string;
	zoom: string;
}

export interface JudgingFormFields {
	technicalAbility: number;
	creativity: number;
	utility: number;
	presentation: number;
	wowFactor: number;
	comments: string;
	feedback: string;
}

export interface TeamSelectData {
	_id: string;
	name: string;
	isMine?: boolean;
	haveJudged?: boolean;
}

export interface NewTeamFields {
	teamName: string;
	devpost: string;
}

export interface TeamProfile {
	name: string;
	joinCode: string;
	devpost: URL;
	members: string[];
}

export interface Report {
	_id?: string;
	email: string;
	name: string;
	role: ReportRole;
	description: string;
	date: string;
	status: ReportStatus;
}

export enum ReportStatus {
	OPEN = 'OPEN',
	IN_PROGRESS = 'IN_PROGRESS',
	CLOSED = 'CLOSED',
}

export enum ReportRole {
	HACKER = 'HACKER',
	JUDGE = 'JUDGE',
}
