import { Form, Input, Button, FormInstance } from 'antd';
import { ReactElement } from 'react';
import ScoreInput from './scoreInput';

const { TextArea } = Input;

function submitForm(formData) {
	console.log(formData);
}

function getInitialValues() {
	// TODO: Replace this!
	return {
		technicalability: 5,
		creativity: 2,
		utility: 7,
		presentation: 4,
		wowfactor: 1,
		comments: 'This project sucked.',
		feedback: 'Great job!',
	};
}

export default function JudgingForm() {
	const layout = {
		labelCol: { span: 7 },
		wrapperCol: { span: 24 },
		labelAlign: 'left',
	};
	const scoreInputsConfig = [
		{ name: 'technicalability', label: 'Technical Ability' },
		{ name: 'creativity', label: 'Creativity' },
		{ name: 'utility', label: 'Utility' },
		{ name: 'presentation', label: 'Presentation' },
		{ name: 'wowfactor', label: 'WOW Factor' },
	];
	const initialValues = getInitialValues();
	const [form] = Form.useForm();

	return (
		<Form {...layout} labelAlign="left" form={form} initialValues={initialValues} onFinish={submitForm}>
			{scoreInputsConfig.map(config => (
				<Form.Item name={config.name} label={config.label} key={config.name}>
					<ScoreInput
						// TODO: it would be great to get the value from the containing Form.Item instead of grabbing it manually
						value={initialValues[config.name as keyof typeof initialValues] as number}
						onChange={val => form.setFieldsValue({ [config.name]: val })}></ScoreInput>
				</Form.Item>
			))}
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
