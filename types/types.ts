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

export interface ResponseError extends Error {
	status?: number;
}
