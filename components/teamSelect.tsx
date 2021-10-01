import { Select, Space, Row } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
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
	return (
		<Space direction="horizontal" align="center">
			<strong>Select a Team</strong>
			<Select defaultValue="lucy" style={{ width: 200 }} onChange={handleChange}>
				<OptGroup label="My Teams">
					<Option value="jack">{showCompletedInDropdown('Jack')}</Option>
					<Option value="lucy">Lucy</Option>
				</OptGroup>
				<OptGroup label="All Teams">
					<Option value="Yiminghe">yiminghe</Option>
				</OptGroup>
			</Select>
		</Space>
	);
}
