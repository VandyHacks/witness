import { CheckCircleOutlined } from '@ant-design/icons';
import { Select, Space, Row } from 'antd';
import { TeamsData } from '../pages/api/team-select';
const { Option, OptGroup } = Select;

interface TeamSelectProps {
	teamsData: TeamsData;
	currentTeamID: string | undefined;
	handleChange: (teamID: string) => Promise<void>;
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
	console.log('Current Team ID:', currentTeamID);
	return (
		<Space direction="horizontal" align="center">
			<strong>Team:</strong>
			<Select defaultValue={currentTeamID} style={{ width: 200 }} onChange={handleChange}>
				<OptGroup label="My Teams">
					{teamsData
						.filter(team => team.isMine)
						.map(team => (
							<Option value={team.teamID} key={team.teamID}>
								{team.judgingReceived
									? withCheckMark(`${team.teamID} - ${team.teamName}`)
									: `${team.teamID} - ${team.teamName}`}
							</Option>
						))}
				</OptGroup>
				<OptGroup label="All Teams">
					{teamsData.map(team => (
						<Option value={team.teamID} key={`${team.teamID}ALL`}>
							{team.judgingReceived
								? withCheckMark(`${team.teamID} - ${team.teamName}`)
								: `${team.teamID} - ${team.teamName}`}
						</Option>
					))}
				</OptGroup>
			</Select>
		</Space>
	);
}
