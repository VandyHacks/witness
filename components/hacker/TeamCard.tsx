import { Button, Card, Form, Input } from 'antd';
import { NewTeamFields } from '../../types/client';

interface Props {
	title: string;
	fields: { name: string; label: string }[];
	submitText: string;
	onSubmit: (value: NewTeamFields | { joinCode: string }) => Promise<void>;
}

export default function TeamCard(props: Props) {
	const { title, fields, submitText, onSubmit } = props;
	const layout = {
		labelCol: { span: 8 },
		wrapperCol: { span: 16 },
	};
	return (
		<Card title={title} type="inner" style={{ maxWidth: '50vw', margin: 'auto' }}>
			<Form {...layout} labelAlign="left" onFinish={onSubmit}>
				{fields.map(field => (
					<Form.Item
						key={field.label}
						label={field.label}
						name={field.name}
						rules={[{ required: true, message: 'This field is required.' }]}>
						<Input />
					</Form.Item>
				))}
				<Button type="primary" htmlType="submit" className="ant-col-offset-8">
					{submitText}
				</Button>
			</Form>
		</Card>
	);
}
