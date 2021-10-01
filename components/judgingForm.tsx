import { Form, Input, Button, FormInstance } from 'antd';
import { ReactElement } from 'react';
import ScoreInput from './scoreInput';

const { TextArea } = Input;

// function submitForm(formData) {
// 	console.log(formData);
// }

// function stupidFunction(stuff) {
// 	console.log(stuff);
// }

function getInitialValues() {
	// Replace this!
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

	const [form] = Form.useForm();

	const scoreInputsConfig = [
		{ name: 'technicalability', label: 'Technical Ability' },
		{ name: 'creativity', label: 'Creativity' },
		{ name: 'utility', label: 'Utility' },
		{ name: 'presentation', label: 'Presentation' },
		{ name: 'wowfactor', label: 'WOW Factor' },
	];

	const initialValues = getInitialValues();
	return (
		<Form {...layout} labelAlign="left" form={form} initialValues={initialValues}>
			{scoreInputsConfig.map(config => (
				<Form.Item name={config.name} label={config.label} key={config.name}>
					<ScoreInput
						value={initialValues[config.name as keyof typeof initialValues] as number}
						onChange={val => form.setFieldsValue({ [config.name]: val })}></ScoreInput>
				</Form.Item>
			))}
			{/* <Form.Item name="technicalability" label="Technical Ability">
				<ScoreInput />
			</Form.Item>
			<Form.Item name="creativity" label="Creativity">
				<ScoreInput onChange={val: number => form.setFieldsValue({ creativity: val })} />
			</Form.Item>
			<Form.Item name="utility" label="Utility">
				<ScoreInput />
			</Form.Item>
			<Form.Item name="presentation" label="Presentation">
				<ScoreInput />
			</Form.Item>
			<Form.Item name="wowfactor" label="WOW Factor">
				<ScoreInput />
			</Form.Item> */}
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
