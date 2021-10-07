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

export interface Users {
	name: string,
	email: string,
	image: string,
	userType: string,
	team: Teams | null
}

export interface Teams {
	name: string,
	joinCode: string,
	devpost: string,
	members: Users[],
	scores: Scores[]
}

export interface Scores {
	team: Teams | null,
	judge: Users | null,
	technicalAbility: number,
	creativity: number,
	utility: number,
	presentation: number,
	wowfactor: number,
	comments: number,
	feedback: number
}

export interface Schedules {
	team: Teams | null,
	judges: Users[],
	zoom: string,
	time: number
}


