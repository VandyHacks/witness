import { Empty, Skeleton } from 'antd';
import { useSWRConfig } from 'swr';
import { useCustomSWR, RequestType } from '../../../utils/request-utils';
import ManageRoleForm, { ManageFormFields } from '../../../components/manageRoleForm';
import { handleManageFormSubmit } from '../../../utils/organizer-utils';

const ManageUsersTab = () => {
	const { mutate } = useSWRConfig();

	// User data
	const { data: userData, error } = useCustomSWR<ManageFormFields>({
		url: '/api/manage-role',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of all users.',
	});

	return (
		<>
			{!userData && <Skeleton />}
			{userData && userData.length == 0 && (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>No users lmao</span>} />
			)}
			{userData && userData.length > 0 && (
				<ManageRoleForm formData={userData} onSubmit={formData => handleManageFormSubmit(formData, mutate)} />
			)}
		</>
	);
};

export default ManageUsersTab;
