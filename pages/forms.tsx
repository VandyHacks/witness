import { Divider, Space, Skeleton, Alert, notification, Empty } from 'antd';
import React, { useState } from 'react';
import JudgingForm from '../components/judgingForm';
import Outline from '../components/outline';
import TeamSelect from '../components/teamSelect';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { JudgingFormData } from './api/judging-form';
import { TeamsData } from './api/team-select';

function handleSubmitSuccess() {
	notification['success']({
		message: 'Successfully submitted!',
		placement: 'bottomRight',
	});
}

function handleSubmitFailure() {
	notification['error']({
		message: 'Oops, something went wrong!',
		description: 'Please try again or contact an organizer if the problem persists.',
		placement: 'bottomRight',
	});
}

async function onSubmit(formData: JudgingFormData) {
	console.log(formData);
	const res = await fetch('/api/judging-form', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	});

	if (res.ok) handleSubmitSuccess();
	else handleSubmitFailure();
}

async function onChooseTeam(teamID: string) {
	console.log('teamID:', teamID);
}

export default function Forms() {
	// Use query string to get team ID
	const router = useRouter();
	const { id: teamID } = router.query;

	// Get data for teams dropdown
	const { data: teamsData, error: teamsError } = useSWR('/api/team-select', async url => {
		const res = await fetch(url, { method: 'GET' });
		return (await res.json()) as TeamsData;
	});
	// Get data for form component, formData will be falsy if teamID is not yet set.
	const { data: formData, error: formError } = useSWR(
		() => (teamID ? ['/api/judging-form', teamID] : null),
		async (url, id) => {
			const res = await fetch(`${url}?id=${id}`, { method: 'GET' });
			return (await res.json()) as JudgingFormData;
		}
	);
	console.log('Team ID!:', teamID);
	console.log('formData:', formData, 'formError:', formError);

	// let content;
	// if (formError || teamsError) {
	// 	// TODO: could be nice to have a more informative error message.
	// 	content = (
	// 		<Alert
	// 			message="An unknown error has occured. Please try again or reach out to an organizer."
	// 			type="error"
	// 		/>
	// 	);
	// }
	// // Loading screen
	// else if (!teamsData) content = <Skeleton />;
	// else {
	// 	content = (
	// 		<Space direction="vertical" style={{ width: '100%' }}>
	// 			<TeamSelect handleChange={() => {}} />
	// 			<Divider />
	// 			<JudgingForm formData={formData} onSubmit={onSubmit} />
	// 		</Space>
	// 	);
	// }
	let pageContent;
	if (teamsError) {
		// if error fetching teams, everything dies
		pageContent = (
			<Alert
				message="An unknown error has occured. Please try again or reach out to an organizer."
				type="error"
			/>
		);
	} else if (!teamsData) {
		// otherwise, wait for teamsData to load
		pageContent = <Skeleton />;
	} else {
		// teamsData loaded, moving on
		let formSection;
		if (!teamID) {
			// if no team selected, show default screen
			formSection = <Empty description="No team selected." />;
		} else if (formError) {
			// if team selected but error in getting team's form, show error
			formSection = (
				<Alert
					message="Cannot get form for selected team. Please try again or reach out to an organizer."
					type="error"
				/>
			);
		} else if (!formData) {
			// team selected without error, wait for loading
			formSection = <Skeleton />;
		} else {
			// everything succeeded, show judging form
			formSection = <JudgingForm formData={formData} onSubmit={onSubmit} />;
		}
		pageContent = (
			<Space direction="vertical" style={{ width: '100%' }}>
				<TeamSelect
					teamsData={teamsData}
					currentTeamID={teamID as string | undefined}
					handleChange={onChooseTeam}
				/>
				<Divider />
				{formSection}
			</Space>
		);
	}
	return (
		<Outline>
			<h1>Judging Form</h1>
			{pageContent}
		</Outline>
	);

	// teamsError: Everything dies
	// no teamsError but no teamsData: skeleton
	// Not teamsError and teamData exists but no teamID: empty for form section
	// Not teamsError and teamData exists and teamID but formsError: just form section dies
	// Not teamsError and teamData exists and teamID and no formsError but no formData: skeleton for formsSection
	// Everything in place: yes
	// return (
	// 	<Outline>
	// 		<h1>Judging Form</h1>
	// 		{!teamsError ? (
	// 			teamsData ? (
	// 				<div>Hello</div>
	// 			) : (
	// 				<Skeleton />
	// 			)
	// 		) : (
	// 			<Alert
	// 				message="An unknown error has occured. Please try again or reach out to an organizer."
	// 				type="error"
	// 			/>
	// 		)}
	// 		{teamsError ? (
	// 			<Alert
	// 				message="An unknown error has occured. Please try again or reach out to an organizer."
	// 				type="error"
	// 			/>
	// 		) : !teamsData ? (
	// 			<Skeleton />
	// 		) : (
	// 			<>
	// 				<TeamSelect handleChange={() => {}} />
	// 				{!teamID ? }
	// 			</>
	// 		)}
	// 	</Outline>
	// );

	// let pageContent;
	// if (teamsError) {
	// 	pageContent = (
	// 		<Alert
	// 			message="An unknown error has occured. Please try again or reach out to an organizer."
	// 			type="error"
	// 		/>
	// 	);
	// } else {
	// 	if (!teamsData) {
	// 		pageContent = <Skeleton />
	// 	} else {
	// 		if (!teamID) {

	// 		}
	// 	}
	// }

	// else {
	// 	let formComponent;
	// 	if (!formError) {
	// 		formComponent = teamID ? <JudgingForm formData={formData} onSubmit={onSubmit} /> :
	// 	} else {

	// 	}
	// 	const formComponent = formError ? <Alert
	// 	message="Cannot get form for selected team. Please try again or reach out to an organizer."
	// 	type="error"
	// /> : <
	// }

	// const formComponent = formData ? (
	// 	<JudgingForm formData={formData} onSubmit={onSubmit} />
	// ) : (
	// 	<Empty description="No team selected." />
	// );
	// const pageContent = teamsError ? teamsData ? (
	// 	<Space direction="vertical" style={{ width: '100%' }}>
	// 		<TeamSelect handleChange={() => {}} />
	// 		<Divider />
	// 		{formComponent}
	// 	</Space>
	// ) : (
	// 	<Skeleton />
	// );
	return (
		<Outline>
			<h1>Judging Form</h1>
			{/* {content} */}
			{teamsData ? (
				<Space direction="vertical" style={{ width: '100%' }}>
					<TeamSelect handleChange={() => {}} />
					<Divider />
				</Space>
			) : (
				<Skeleton />
			)}
		</Outline>
	);
}