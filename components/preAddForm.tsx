import { Form, Select, Input, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

export interface PreAddFormFields {
	name: string;
	email: string;
	userType: string;
	note: string;
}

export interface PreAddFormProps {
	onSubmit: (values: PreAddFormFields[]) => Promise<void>;
}

export default function PreAddForm(props: PreAddFormProps) {
	const [form] = Form.useForm();

	const { onSubmit } = props;

	return (
		<Form name="preadd" form={form} layout="horizontal" onFinish={onSubmit} requiredMark>
			<Form.List name="users">
				{(fields, { add, remove }) => (
					<>
						{fields.map(({ key, name, ...restFields }) => (
							<Space key={key} align="start">
								<Form.Item
									name={[name, 'name']}
									rules={[{ required: true, message: 'Name is required.' }]}
								>
									<Input placeholder="Name" />
								</Form.Item>
								<Form.Item
									{...restFields}
									name={[name, 'email']}
									rules={[
										{ type: 'email', message: 'Please enter a valid email.' },
										{ required: true, message: 'Email is required.' },
									]}
									extra="should match with the email they sign in with"
								>
									<Input placeholder="Email" style={{ width: 350 }} />
								</Form.Item>
								<Form.Item
									{...restFields}
									name={[name, 'userType']}
									extra="their role on sign in"
									rules={[{ required: true, message: 'Please select a role.' }]}
								>
									<Select placeholder="Select Role" style={{ width: 200 }}>
										<Option value="HACKER">Hacker</Option>
										<Option value="JUDGE">Judge</Option>
										<Option value="ORGANIZER">Organizer</Option>
									</Select>
								</Form.Item>
								<Form.Item {...restFields} name={[name, 'note']}>
									<TextArea
										style={{ width: 350 }}
										placeholder="Note (why are we preadding them)"
										rows={1}
									/>
								</Form.Item>
								<MinusCircleOutlined onClick={() => remove(name)} />
							</Space>
						))}
						<Form.Item>
							<Button type="default" onClick={() => add()} block icon={<PlusOutlined />}>
								Add User Info
							</Button>
						</Form.Item>
						<Button type="primary" htmlType="submit">
							Submit
						</Button>
					</>
				)}
			</Form.List>
		</Form>
	);
}
