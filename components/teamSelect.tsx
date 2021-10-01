import { CheckCircleOutlined } from '@ant-design/icons';
import { Select, Space, Row } from 'antd';
import { TeamsData } from '../pages/api/team-select';
const { Option, OptGroup } = Select;

interface TeamSelectProps {
	teamsData: TeamsData;
	handleChange(id: string): void;
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
	const { teamsData, handleChange } = props;
	return (
		<Space direction="horizontal" align="center">
			<strong>Select a Team</strong>
			<Select defaultValue="lucy" style={{ width: 200 }} onChange={handleChange}>
				<OptGroup label="My Teams">
					{teamsData
						.filter(team => team.isMine)
						.map(team => (
							<Option value={team.teamID} key={team.teamID}>
								{team.judgingReceived
									? withCheckMark(`${team.teamID}: ${team.teamName}`)
									: `${team.teamID}: ${team.teamName}`}
							</Option>
						))}
				</OptGroup>
				<OptGroup label="All Teams">
					{teamsData.map(team => (
						<Option value={team.teamID} key={team.teamID}>
							{team.judgingReceived
								? withCheckMark(`${team.teamID}: ${team.teamName}`)
								: `${team.teamID}: ${team.teamName}`}
						</Option>
					))}
				</OptGroup>
			</Select>
		</Space>
	);
}
