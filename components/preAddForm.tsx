import { Form, Select, Input, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

export default function PreAddForm() {
	const [form] = Form.useForm();

	return (
		<Form name="preadd" form={form} layout="horizontal" onFinish={vals => console.log(vals)} requiredMark>
			<Form.List name="users">
				{(fields, { add, remove }) => (
					<>
						{fields.map(({ key, name, ...restFields }) => (
							<Space key={key} align='start'>
								<Form.Item name={[name, "name"]} required>
									<Input placeholder='Name' />
								</Form.Item>
								<Form.Item
									{...restFields}
									name={[name, "email"]}
									required
									rules={[{ type: 'email' }]}
									extra="this should match with the email they will sign in with"
								>
									<Input placeholder='Email' />
								</Form.Item>
								<Form.Item
									{...restFields}
									name={[name, "role"]}
									extra="this will be their role on sign in"
									required
								>
									<Select placeholder="Select Role">
										<Option value="HACKER">Hacker</Option>
										<Option value="JUDGE">Judge</Option>
										<Option value="ORGANIZER">Organizer</Option>
									</Select>
								</Form.Item>
								<Form.Item {...restFields} name={[name, "note"]}>
									<TextArea style={{ width: 350 }} placeholder="Note (why are we preadding them)" rows={1} />
								</Form.Item>
								<MinusCircleOutlined {...restFields} onClick={() => remove(name)} />
							</Space>
						))}
						<Form.Item>
							<Button type='default' onClick={() => add()} block icon={<PlusOutlined />}>
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
