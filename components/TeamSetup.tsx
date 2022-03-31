import { Col, Divider, Row } from "antd";
import { useSWRConfig } from "swr";
import { ScopedMutator } from "swr/dist/types";
import { handleRequestFailure } from "../lib/helpers";
import { NewTeamFields } from "../types/client";
import TeamCard from "./TeamCard";

async function handleSubmit(formData: NewTeamFields | { joinCode: string }, mutate: ScopedMutator<any>) {
	const res = await fetch('/api/team-management', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	});

	if (res.ok) {
		console.log('Received:', await res.text());
		mutate('/api/team-management');
	} else handleRequestFailure(await res.text());
}

export default function TeamSetup() {
	const { mutate } = useSWRConfig();
	return (
		<>
			<Row justify="center">
				<Col span={12}>
					<TeamCard
						title="Create a New Team"
						fields={[
							{ name: 'teamName', label: 'Team Name' },
							{ name: 'devpost', label: 'Devpost' },
						]}
						submitText="Create Team"
						onSubmit={formData => handleSubmit(formData, mutate)}
					/>
				</Col>
			</Row>
			<Row justify="center">
				<Col span={12}>
					<Divider>Or</Divider>
				</Col>
			</Row>
			<Row justify="center">
				<Col span={12}>
					<TeamCard
						title="Join an Existing Team"
						fields={[{ name: 'joinCode', label: 'Join Code' }]}
						submitText="Join Team"
						onSubmit={formData => handleSubmit(formData, mutate)}
					/>
				</Col>
			</Row>
		</>
	);
}