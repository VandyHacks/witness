import { Form, Input, Button } from 'antd';
import ScoreInput from './scoreInput';

const { TextArea } = Input;

export default function JudgingForm() {
	const layout = {
		labelCol: { span: 7 },
		wrapperCol: { span: 24 },
	};
	return (
		<Form {...layout} labelAlign="left">
			<Form.Item name="technicalAbility" label="Technical Ability" rules={[{ required: true }]}>
				<ScoreInput />
			</Form.Item>
			<Form.Item name="creativity" label="Creativity" rules={[{ required: true }]}>
				<ScoreInput />
			</Form.Item>
			<Form.Item name="utility" label="Utility" rules={[{ required: true }]}>
				<ScoreInput />
			</Form.Item>
			<Form.Item name="presentation" label="Presentation" rules={[{ required: true }]}>
				<ScoreInput />
			</Form.Item>
			<Form.Item name="wowFactor" label="WOW Factor" rules={[{ required: true }]}>
				<ScoreInput />
			</Form.Item>
			<Form.Item name="comments" label="Comments">
				<TextArea />
			</Form.Item>
			<Form.Item name="feedback" label="Feedback" extra="this will be shared with the team">
				<TextArea />
			</Form.Item>
			<Button type="primary" htmlType="submit" className="ant-col-offset-12">
				Submit
			</Button>
		</Form>
	);
}
