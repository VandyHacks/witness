import { Form, Button, Select, Row, Col } from 'antd';
import Text from 'antd/lib/typography/Text';
import { useState } from 'react';

const { Option } = Select;

export interface ManageFormFields {
	_id: string;
	name: string;
	userType: string;
	email: string;
}

export interface ManageFormProps {
	formData: ManageFormFields[];
	onSubmit: (value: ManageFormFields) => Promise<void>;
}

export default function ManageRoleForm(props: ManageFormProps) {
	const { onSubmit } = props;
	const layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 6 },
		labelAlign: 'left',
	};

	const [modified, setModified] = useState<string[]>([]);

	// TODO: probably add search
	const [form] = Form.useForm();

	return (
		<Form {...layout} labelAlign="left" form={form} onFinish={onSubmit}>
			{props.formData.map(config => (
				<Form.Item
					name={config._id}
					// display name and email
					label={
						<Text style={{ height: '50px' }}>
							{config.name}
							<br />
							<Text type="secondary">{config.email}</Text>
						</Text>
					}
					colon={false}
					key={config._id}
					initialValue={config.userType}
				>
					<Select
						placeholder="Select Role"
						status={modified.includes(config._id) ? 'warning' : ''}
						// not really a warning just good visually
						// make box glow if role has been changed
						onSelect={(role: string) => {
							if (role !== props.formData.find(user => user._id === config._id)?.userType) {
								setModified([...modified, config._id]);
							} else {
								setModified([...modified.filter(user => user !== config._id)]);
							}
						}}
					>
						<Option value="HACKER">Hacker</Option>
						<Option value="JUDGE">Judge</Option>
						<Option value="ORGANIZER">Organizer</Option>
					</Select>
				</Form.Item>
			))}
			<Row gutter={16}>
				<Col offset={10}>
					<Button type="primary" htmlType="submit">
						Submit
					</Button>
				</Col>
				<Col>
					<Button
						htmlType="reset"
						onClick={() => {
							form.resetFields();
							setModified([]);
						}}
					>
						Clear
					</Button>
				</Col>
			</Row>
		</Form>
	);
}
