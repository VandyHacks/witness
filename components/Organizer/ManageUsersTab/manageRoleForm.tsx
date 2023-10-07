import { Form, Button, Select, Row, Col, message } from 'antd';
import Text from 'antd/lib/typography/Text';
import { useContext, useState } from 'react';
import { ThemeContext, getAccentColor, getThemedClass } from '../../../theme/themeProvider';
import styles from '../../../styles/ManageUsersTab.module.css';

const { Option } = Select;

export interface ManageFormFields {
	_id: string;
	name: string;
	userType: string;
	email: string;
}

export interface ManageFormProps {
	formData: ManageFormFields[];
	onSubmit: (value: ManageFormFields) => Promise<void>;
}

export default function ManageRoleForm({ onSubmit, formData }: ManageFormProps) {
	const layout = {
		labelCol: { span: 16 },
		labelAlign: 'left',
	};

	const { accentColor, baseTheme } = useContext(ThemeContext);

	const [modified, setModified] = useState<string[]>([]);

	// TODO: probably add search
	const [form] = Form.useForm();

	return (
		<Form {...layout} labelAlign="left" form={form} onFinish={onSubmit}>
			{formData.map(config => (
				<Form.Item
					name={config._id}
					// display name and email
					label={
						<div>
							<span className={styles[getThemedClass('manageUserPrimaryLabel', baseTheme)]}>
								{config.name}
							</span>
							<div
								style={{
									color: getAccentColor(accentColor, baseTheme),
									fontWeight: 200,
									paddingBottom: '5px',
								}}>
								{config.email}
							</div>
						</div>
					}
					colon={false}
					key={config._id}
					initialValue={config.userType}>
					<Select
						placeholder="Select Role"
						// make box glow if role has been changed
						status={modified.includes(config._id) ? 'warning' : ''}
						onSelect={(role: string) => {
							if (role !== formData.find(user => user._id === config._id)?.userType) {
								setModified([...modified, config._id]);
							} else {
								setModified([...modified.filter(user => user !== config._id)]);
							}
						}}>
						<Option value="HACKER">Hacker</Option>
						<Option value="JUDGE">Judge</Option>
						<Option value="ORGANIZER">Organizer</Option>
					</Select>
				</Form.Item>
			))}
			<Row gutter={16}>
				<Col offset={10}>
					<button
						type="submit"
						className={styles['manageUserSubmitButton']}
						style={{ backgroundColor: getAccentColor(accentColor, baseTheme) }}>
						Submit
					</button>
				</Col>
				<Col>
					<button
						type="reset"
						className={styles['manageUserClearButton']}
						onClick={() => {
							form.resetFields();
							message.success('Successfuly reset form!');
							setModified([]);
						}}>
						Clear
					</button>
				</Col>
			</Row>
		</Form>
	);
}
