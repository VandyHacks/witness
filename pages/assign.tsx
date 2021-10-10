import { notification, Empty } from 'antd';
import React from 'react';
import AssignRoleForm, { AssignFormFields } from '../components/assignRoleForm';
import Outline from '../components/outline';
import useSWR, { useSWRConfig } from 'swr';
import { ScopedMutator } from 'swr/dist/types';
import { signIn, useSession } from 'next-auth/client';
import { ResponseError } from '../types/database';
import ErrorMessage from '../components/errorMessage';

function handleSubmitSuccess() {
	notification['success']({
		message: `Successfully updated!`,
		placement: 'bottomRight',
	});
}

function handleSubmitFailure(msg: string) {
	notification['error']({
		message: 'Oops woopsy, something went fucky wucky',
		description: msg || 'Please try again or contact an organizer if the problem persists.',
		placement: 'bottomRight',
	});
}

async function handleSubmit(roleData: AssignFormFields, mutate: ScopedMutator<any>) {
	const res = await fetch(`/api/assign-role`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ formData: roleData }),
	});

	if (res.ok) {
		mutate('/api/assign');
		handleSubmitSuccess();
	} else handleSubmitFailure(await res.text());
}

export default function Forms() {
	// Use query string to get team ID

	// Get data for teams dropdown
	const { data: userData, error } = useSWR('/api/assign-role', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) {
			const error = new Error('Failed to get list of users without roles.') as ResponseError;
			error.status = res.status;
			throw error;
		}

		return (await res.json()) as { _id: string; name: string }[];
	});

	// Get mutate function to reload teams list with updated data on form submission.
	const { mutate } = useSWRConfig();

	const [session, loading] = useSession();
	if (!loading && !session) return signIn();

	let pageContent;
	if (error) {
		// if error fetching teams, everything dies
		pageContent = <ErrorMessage status={error.status} />;
	} else if (!userData?.length) {
		// if no data then no users to assign roles to
		pageContent = <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>No users without roles</span>} />;
	} else {
		// everything succeeded, show judging form
		pageContent = <AssignRoleForm formData={userData} onSubmit={formData => handleSubmit(formData, mutate)} />;
	}

	return (
		<Outline selectedKey="assign">
			<h1>Assign Roles</h1>
			{pageContent}
		</Outline>
	);
}
