import { Form, Button, Select } from 'antd';
import Text from 'antd/lib/typography/Text';

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
		labelCol: { span: 7 },
		wrapperCol: { span: 24 },
		labelAlign: 'left',
	};

	// TODO: probably add search
	const [form] = Form.useForm();

	return (
		<>
			<Form {...layout} labelAlign="left" form={form} onFinish={onSubmit}>
				{props.formData.map(config => (
					<Form.Item
						name={config._id}
						// display name and email
						label={
							<Text>
								{config.name}
								<br />
								<Text type="secondary">{config.email}</Text>
							</Text>
						}
						colon={false}
						key={config._id}
						initialValue={config.userType}
					>
						<Select placeholder="Select Role">
							<Option value="HACKER">Hacker</Option>
							<Option value="JUDGE">Judge</Option>
							<Option value="ORGANIZER">Organizer</Option>
						</Select>
					</Form.Item>
				))}
				<Button type="primary" htmlType="submit" className="ant-col-offset-12">
					Submit
				</Button>
			</Form>
		</>
	);
}
