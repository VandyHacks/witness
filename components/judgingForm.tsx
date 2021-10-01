import { Form, Input, Button, Skeleton, Alert, notification } from 'antd';
import useSWR from 'swr';
import { Data } from '../pages/api/judgingform';
import ScoreInput from './scoreInput';

const { TextArea } = Input;

function handleSuccess() {
	notification['success']({
		message: 'Successfully submitted!',
		placement: 'bottomRight',
	});
}

function handleFailure() {
	notification['error']({
		message: 'Oops, something went wrong!',
		description: 'Please try again or contact an organizer if the problem persists.',
		placement: 'bottomRight',
	});
}

async function submitForm(formData: Data) {
	console.log(formData);
	const res = await fetch('/api/judgingForm', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(formData),
	});

	if (res.ok) handleSuccess();
	else handleFailure();
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

	const { data, error } = useSWR('/api/judgingForm', async url => {
		const res = await fetch(url, { method: 'GET' });
		return (await res.json()) as Data;
	});

	const [form] = Form.useForm();

	if (error)
		return (
			<Alert
				message="An unknown error has occured. Please try again or reach out to an organizer."
				type="error"
			/>
		);
	// Loading screen
	if (!data) return <Skeleton />;
	return (
		<Form {...layout} labelAlign="left" form={form} initialValues={data} onFinish={submitForm}>
			{scoreInputsConfig.map(config => (
				<Form.Item name={config.name} label={config.label} key={config.name}>
					<ScoreInput
						// TODO: it would be great to get the value from the containing Form.Item instead of grabbing it manually
						value={data[config.name as keyof typeof data] as number}
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
