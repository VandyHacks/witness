import useSWR from "swr";
import TeamManager from "../components/TeamManager";
import TeamSetup from "../components/TeamSetup";
import { TeamProfile } from "../types/client";

export default function HackerDash() {
    const { data: teamData, error: teamError } = useSWR('/api/team-management', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) return;
		const { members, ...rest } = await res.json();

		return { members: members.map((member: any) => member.name), ...rest } as TeamProfile;
	});

    return (
        <>
            { !teamData && <TeamSetup /> }
            { teamData && <TeamManager profile={teamData} /> }
        </>
    );
}