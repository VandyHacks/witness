import { CheckCircleOutlined } from '@ant-design/icons';
import { Row, Select, Space } from 'antd';
import React, { Dispatch, SetStateAction, useContext } from 'react';
import { TeamSelectData } from '../../../types/client';
import { useSession } from 'next-auth/react';
import { ThemeContext, getBaseColor } from '../../../theme/themeProvider';
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

const optionComparator = (input: string, option: string) => {
	let searchPosition = 0;
	const cin = input.toLowerCase();
	const opt = option.toLowerCase();
	for (let i = 0; i < opt.length; ++i) {
		if (opt[i] === cin[searchPosition]) ++searchPosition;
		else break;
	}
	return searchPosition === input.length;
};

export default function TeamSelect(props: TeamSelectProps) {
	const { teamsData, currentTeamID, handleChange } = props;
	const { data: session } = useSession();
	const { baseTheme } = useContext(ThemeContext);

	return (
		<Space direction="horizontal" align="center" wrap>
			<strong
				style={{
					color: getBaseColor(baseTheme),
				}}>
				Team:
			</strong>
			<Select
				showSearch
				value={currentTeamID ? currentTeamID : 'Select a team'}
				style={{ width: 300, maxWidth: '60vw' }}
				onChange={handleChange}
				allowClear
				filterOption={(input, option) => optionComparator(input, String(option?.children))}>
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
			</Select>
		</Space>
	);
}
