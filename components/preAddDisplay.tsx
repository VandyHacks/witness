import { Card, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { PreAddData } from '../types/database';

export interface PreAddDisplayProps {
	data: PreAddData[];
	onDelete: (user: PreAddData) => Promise<void>;
}

export default function PreAddDisplay(props: PreAddDisplayProps) {
	const { data, onDelete } = props;
	return (
		<Space size="middle" align="end" wrap>
			{data.map((user, idx) => (
				<Card
					key={idx}
					title={user.name}
					style={{ width: 350, height: 400 }}
					actions={[<DeleteOutlined key={idx} onClick={() => onDelete(user)} />]}
				>
					<p>{user.email}</p>
					<p>Role: {user.userType}</p>
					<p>Added by {user.addedBy}</p>
					<p>{user.note}</p>
				</Card>
			))}
		</Space>
	);
}
