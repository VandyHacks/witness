import ScoreInput from './ScoreInput';
import { Form, Input, Button } from 'antd';
import { JudgingFormFields } from '../../../types/client';
import { useEffect } from 'react';
const { TextArea } = Input;

export interface JudgingFormProps {
	formData: JudgingFormFields;
	isNewForm: boolean;
	onSubmit: (value: JudgingFormFields) => Promise<void>;
}

export default function JudgingForm(props: JudgingFormProps) {
	const { formData, isNewForm, onSubmit } = props;
	const layout = {
		labelCol: { span: 7 },
		wrapperCol: { span: 24 },
		labelAlign: 'left',
	};

	const scoreInputsConfig = [
		{ name: 'technicalAbility', label: 'Technical Ability' },
		{ name: 'creativity', label: 'Creativity' },
		{ name: 'utility', label: 'Utility' },
		{ name: 'presentation', label: 'Presentation' },
		{ name: 'wowFactor', label: 'WOW Factor' },
	];

	const [form] = Form.useForm();
	useEffect(() => {
		form.setFieldsValue(formData);
	}, [form, formData]);

	return (
		<>
			<p style={{ color: 'red' }}>All fields are required.</p>
			<Form {...layout} labelAlign="left" form={form} initialValues={formData} onFinish={onSubmit}>
				{scoreInputsConfig.map(config => (
					<Form.Item name={config.name} label={config.label} key={config.name}>
						<ScoreInput
							value={formData[config.name as keyof typeof formData] as number}
							onChange={val => form.setFieldsValue({ [config.name]: val })}
						/>
					</Form.Item>
				))}
				<Form.Item name="comments" label="Comments">
					<TextArea />
				</Form.Item>
				<Form.Item name="feedback" label="Feedback" extra="This will be shared with the team!">
					<TextArea />
				</Form.Item>
				<Button type="primary" htmlType="submit" className="ant-col-offset-12">
					{isNewForm ? 'Submit' : 'Update'}
				</Button>
			</Form>
		</>
	);
}
