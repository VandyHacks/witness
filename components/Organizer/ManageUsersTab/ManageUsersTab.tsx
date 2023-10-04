import { Empty, Skeleton } from 'antd';
import { useSWRConfig } from 'swr';
import { useCustomSWR, RequestType } from '../../../utils/request-utils';
import ManageRoleForm, { ManageFormFields } from './manageRoleForm';
import { ScopedMutator } from 'swr/dist/types';
import { handleSubmitSuccess, handleSubmitFailure } from '../../../lib/helpers';

const ManageUsersTab = () => {
	const { mutate } = useSWRConfig();

	/**
	 * Handles submission of the Manage Form with the specified role data.
	 * @param {ManageFormFields} roleData - The form data for the role being managed.
	 * @param {ScopedMutator} mutate - The scoped mutator function to update the query cache.
	 */
	const handleManageFormSubmit = async (roleData: ManageFormFields, mutate: ScopedMutator) => {
		const res = await fetch(`/api/manage-role`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ formData: roleData }),
		});

		if (res.ok) {
			mutate('/api/manage-role');
			handleSubmitSuccess();
		} else handleSubmitFailure(await res.text());
	};

	// User data
	const { data: userData, error } = useCustomSWR<ManageFormFields[]>({
		url: '/api/manage-role',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of all users.',
	});

	return (
		<>
			{!userData ? (
				// no user data
				<Skeleton />
			) : userData.length === 0 ? (
				// 0 users
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>No users lmao</span>} />
			) : (
				// users exist
				<ManageRoleForm formData={userData} onSubmit={formData => handleManageFormSubmit(formData, mutate)} />
			)}
		</>
	);
};

export default ManageUsersTab;
