import { CheckCircleOutlined } from '@ant-design/icons';
import { Row, Select, Space } from 'antd';
import React, { Dispatch, SetStateAction } from 'react';
import { TeamSelectData } from '../../types/client';
import { useSession } from 'next-auth/react';
const { Option, OptGroup } = Select;

interface TeamSelectProps {
	teamsData: TeamSelectData[];
	currentTeamID: string | undefined;
	handleChange: Dispatch<SetStateAction<string>>;
}

function withCheckMark(value: string) {
	return (
		<Row justify="space-between" align="middle">
			{value}
			<CheckCircleOutlined style={{ color: 'green' }} />
		</Row>
	);
}
export default function TeamSelect(props: TeamSelectProps) {
	const { teamsData, currentTeamID, handleChange } = props;
	const { data: session } = useSession();

	return (
		<Space direction="horizontal" align="center" wrap>
			<strong>Team:</strong>
			<Select
				value={currentTeamID ? currentTeamID : 'Select a team'}
				style={{ width: 300, maxWidth: '60vw' }}
				onChange={handleChange}
				allowClear>
				{session?.userType === 'JUDGE' && (
					<OptGroup label="My Teams">
						{teamsData
							.filter(team => team.isMine)
							.map(team => (
								<Option value={team._id} key={team._id}>
									{team.haveJudged ? withCheckMark(team.name) : team.name}
								</Option>
							))}
					</OptGroup>
				)}
				<OptGroup label="All Teams">
					{teamsData.map(team => (
						<Option value={team._id} key={`${team._id}ALL`}>
							{team.haveJudged ? withCheckMark(team.name) : team.name}
						</Option>
					))}
				</OptGroup>
			</Select>
		</Space>
	);
}
