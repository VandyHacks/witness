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
	id: string;
	name: string;
	isMine: boolean;
	haveJudged: boolean;
}
