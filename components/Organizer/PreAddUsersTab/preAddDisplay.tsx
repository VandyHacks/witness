import { Card, Space, Tooltip } from 'antd';
import { DeleteOutlined, QuestionCircleTwoTone, CheckCircleTwoTone } from '@ant-design/icons';
import { PreAddData } from '../../../types/database';

export interface PreAddDisplayProps {
	data: PreAddData[];
	onDelete: (user: PreAddData) => Promise<void>;
}

export default function PreAddDisplay(props: PreAddDisplayProps) {
	const { data, onDelete } = props;
	return (
		<Space size="middle" align="end" wrap style={{ alignItems: 'stretch' }}>
			{data.map((user, idx) => (
				<Card
					key={idx}
					title={user.name}
					extra={
						<>
							status:{' '}
							<Tooltip title={user.status.toLowerCase()}>
								{user.status === 'JOINED' ? (
									<CheckCircleTwoTone twoToneColor="#52c41a" /> // green check
								) : (
									<QuestionCircleTwoTone twoToneColor="#ff9500" />
								)}
							</Tooltip>
						</>
					}
					style={{ width: 350, height: '100%' }}
					actions={[<DeleteOutlined key={idx} onClick={() => onDelete(user)} />]}
					/* Stretch body of card to max height, ignoring header and footer */
					bodyStyle={{ height: 'calc(100% - 106px)' }}>
					<p>{user.email}</p>
					<p>Role: {user.userType}</p>
					<p>Added by {user.addedBy}</p>
					<p>{user.note}</p>
				</Card>
			))}
		</Space>
	);
}
