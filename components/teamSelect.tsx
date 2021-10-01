import { CheckCircleOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import { TeamsList } from '../pages/api/team-select';
import { Skeleton, Alert } from 'antd';
import { Select, Space, Row } from 'antd';
const { Option, OptGroup } = Select;

interface TeamSelectProps {
	handleChange(id: string): void;
}

function showCompletedInDropdown(value: string) {
	return (
		<Row justify="space-between" align="middle">
			{value}
			<CheckCircleOutlined style={{ color: 'green' }} />
		</Row>
	);
}
export default function TeamSelect(props: TeamSelectProps) {
	const { handleChange } = props;
	const { data, error } = useSWR('/api/team-select', async url => {
		const res = await fetch(url, { method: 'GET' });
		return (await res.json()) as TeamsList;
	});

	if (error)
		return (
			<Alert
				message="An unknown error has occured in when loading the judging form. Please try again or reach out to an organizer."
				type="error"
			/>
		);
	// Loading screen
	if (!data) return <Skeleton />;
	return (
		<Space direction="horizontal" align="center">
			<strong>Select a Team</strong>
			<Select defaultValue="lucy" style={{ width: 200 }} onChange={handleChange}>
				<OptGroup label="My Teams">
					{}
					{/* <Option value="jack">{showCompletedInDropdown('Jack')}</Option>
					<Option value="lucy">Lucy</Option> */}
				</OptGroup>
				<OptGroup label="All Teams">
					<Option value="Yiminghe">yiminghe</Option>
				</OptGroup>
			</Select>
		</Space>
	);
}
