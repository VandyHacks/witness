import { Button, Popconfirm } from 'antd';
import { useSWRConfig } from 'swr';
import { ScopedMutator } from 'swr/dist/types';

export default function LeaveButton({ onLeave }: { onLeave: (mutate: ScopedMutator<any>) => Promise<void> }) {
	const { mutate } = useSWRConfig();
	return (
		<Popconfirm
			title="Are you sure?"
			placement="right"
			okText="Yes"
			cancelText="No"
			onConfirm={() => onLeave(mutate)}
		>
			<Button type="primary" danger>
				Leave Team
			</Button>
		</Popconfirm>
	);
}
