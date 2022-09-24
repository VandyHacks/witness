import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select, Space } from 'antd';
import { useSWRConfig } from 'swr';
import { handleSubmitFailure, handleSubmitSuccess } from '../lib/helpers';

const { Option } = Select;
const { TextArea } = Input;

export interface PreAddFormFields {
	name: string;
	email: string;
	userType: string;
	note: string;
}

export default function PreAddForm() {
	const [form] = Form.useForm();

	const { mutate } = useSWRConfig();

	async function handleSubmit(preAddData: PreAddFormFields[]) {
		const res = await fetch('/api/preadd', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ formData: preAddData }),
		});

		if (res.ok) {
			mutate('/api/preadd');
			handleSubmitSuccess(await res.text());
			form.resetFields();
		} else handleSubmitFailure(await res.text());
	}

	return (
		<Form name="preadd" form={form} layout="horizontal" onFinish={handleSubmit} requiredMark>
			<Form.List name="users">
				{(fields, { add, remove }) => (
					<>
						{fields.map(({ key, name, ...restFields }) => (
							<Space key={key} align="start">
								<Form.Item
									name={[name, 'name']}
									rules={[{ required: true, message: 'Name is required.' }]}>
									<Input placeholder="Name" />
								</Form.Item>
								<Form.Item
									{...restFields}
									name={[name, 'email']}
									rules={[
										{ type: 'email', message: 'Please enter a valid email.' },
										{ required: true, message: 'Email is required.' },
									]}
									extra="should match with the email they sign in with">
									<Input placeholder="Email" style={{ width: 350 }} />
								</Form.Item>
								<Form.Item
									{...restFields}
									name={[name, 'userType']}
									extra="their role on sign in"
									rules={[{ required: true, message: 'Please select a role.' }]}>
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
