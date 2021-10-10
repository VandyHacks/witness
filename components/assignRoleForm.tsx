import { Form, Button, Select } from 'antd';
import { JudgingFormFields } from '../types/client';
import { useEffect } from 'react';

const { Option } = Select;

export interface AssignFormFields {
	_id: string;
	name: string;
}

export interface AssignFormProps {
	formData: AssignFormFields[];
	onSubmit: (value: AssignFormFields) => Promise<void>;
}

export default function AssignRoleForm(props: AssignFormProps) {
	const { formData, onSubmit } = props;
	const layout = {
		labelCol: { span: 7 },
		wrapperCol: { span: 24 },
		labelAlign: 'left',
	};

	const [form] = Form.useForm();

	return (
		<>
			<Form {...layout} labelAlign="left" form={form} onFinish={onSubmit}>
				{props.formData.map(config => (
					<Form.Item name={config._id} label={config.name} key={config._id}>
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
