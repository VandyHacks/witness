import { Divider, Skeleton } from "antd";
import useSWR from "swr";
import AllScores from "../components/allScores";
import OrganizerSchedule from "../components/schedule";
import { ScheduleDisplay } from "../types/client";
import { ResponseError, ScoreData, TeamData, UserData } from "../types/database";

export default function OrganizerDash() {
    const { data: teamsData, error: teamsError } = useSWR('/api/teams', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of teams.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as TeamData[];
	});

    const { data: scoresData, error: scoresError } = useSWR('/api/scores', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of scores.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as ScoreData[];
	});

    const { data: usersData, error: usersError } = useSWR('/api/users?usertype=JUDGE', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of judges.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as UserData[];
	});

	const { data: scheduleData, error: scheduleError } = useSWR('/api/schedule', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get schedule.') as ResponseError;
			error.status = res.status;
			throw error;
		}
		return (await res.json()) as ScheduleDisplay[];
	});
    
    return (
        <>
			{ !scheduleData && <Skeleton /> }
			{ scheduleData && <OrganizerSchedule data={scheduleData} /> }
			<Divider />
            { teamsData && <>
				{ /* Add dropdown here w/ functionality */ }
				{ usersData && <AllScores
					teamData={teamsData}
					scoreData={scoresData!}
					userData={usersData}
				/> }
			</>}
			{ (!teamsData || !usersData) && <Skeleton /> }
        </>
    )
}