export interface ScheduleDisplay {
	time: string;
	teamName: string;
	memberNames: string[];
	judgeNames: string[];
	devpost: string;
	zoom: string;
}

export interface ScoreFormFields {
	technicalAbility: number;
	creativity: number;
	utility: number;
	presentation: number;
	wowFactor: number;
	comments: string;
	feedback: string;
}
