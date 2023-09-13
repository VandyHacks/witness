import { Button, Popconfirm } from 'antd';
import { useSWRConfig } from 'swr';
import { ScopedMutator } from 'swr/dist/types';

const LeaveButton = ({ onLeave }: { onLeave: (mutate: ScopedMutator) => Promise<void> }) => {
	const { mutate } = useSWRConfig();
	return (
		<Popconfirm
			title="Are you sure?"
			placement="right"
			okText="Yes"
			cancelText="No"
			onConfirm={() => onLeave(mutate)}>
			<Button type="primary" danger>
				Leave Team
			</Button>
		</Popconfirm>
	);
};

export default LeaveButton;
