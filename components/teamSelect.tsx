import { CheckCircleOutlined } from '@ant-design/icons';
import { Row, Select, Space } from 'antd';
import React, { Dispatch, SetStateAction } from 'react';
import { TeamSelectData } from '../types/client';
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
	return (
		<Space direction="horizontal" align="center" wrap>
			<strong>Team:</strong>
			<Select
				value={currentTeamID ? currentTeamID : 'Select a team'}
				style={{ width: 300, maxWidth: '60vw' }}
				onChange={handleChange}>
				<OptGroup label="My Teams">
					{teamsData
						.filter(team => team.isMine)
						.map(team => (
							<Option value={team.teamID} key={team.teamID}>
								{team.haveJudged ? withCheckMark(team.teamName) : team.teamName}
							</Option>
						))}
				</OptGroup>
				<OptGroup label="All Teams">
					{teamsData.map(team => (
						<Option value={team.teamID} key={`${team.teamID}ALL`}>
							{team.haveJudged ? withCheckMark(team.teamName) : team.teamName}
						</Option>
					))}
				</OptGroup>
			</Select>
		</Space>
	);
}
