import { Empty, Skeleton } from 'antd';
import { useSWRConfig } from 'swr';
import { useCustomSWR, RequestType } from '../../../utils/request-utils';
import { handlePreAddDelete } from '../../../utils/organizer-utils';
import { PreAddData } from '../../../types/database';
import PreAddForm from '../../../components/preAddForm';
import PreAddDisplay from '../../../components/preAddDisplay';

const PreAddUsersTab = () => {
	const { mutate } = useSWRConfig();

	// Preadd data
	const { data: preAddData, error: preAddError } = useCustomSWR<PreAddData>({
		url: '/api/preadd',
		method: RequestType.GET,
		errorMessage: 'Failed to get list of preadded users.',
	});

	return (
		<>
			{preAddData && preAddData.length === 0 && (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>No preadded users lmao</span>} />
			)}
			{preAddData && preAddData.length > 0 && (
				<PreAddDisplay data={preAddData!} onDelete={user => handlePreAddDelete(user, mutate)} />
			)}
			<PreAddForm />
		</>
	);
};

export default PreAddUsersTab;
