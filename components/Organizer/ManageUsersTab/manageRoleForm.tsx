import { Form, Button, Select, Row, Col, message, Input } from 'antd';
import Text from 'antd/lib/typography/Text';
import { useContext, useState } from 'react';
import { ThemeContext, getAccentColor, getThemedClass } from '../../../theme/themeProvider';
import styles from '../../../styles/ManageUsersTab.module.css';
import Highlighter from 'react-highlight-words';

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
	const [nameFilter, setNameFilter] = useState('');
	const [roleFilter, setRoleFilter] = useState('');
	const [sortOrder, setSortOrder] = useState('ascend');
	const [form] = Form.useForm();

	const filteredData = formData
		.filter(item => {
			const name = item.name.toLowerCase().includes(nameFilter.toLowerCase());
			const role = roleFilter ? item.userType === roleFilter : true;
			return name && role;
		})
		.sort((a, b) => {
			if (sortOrder === 'ascend') {
				return a.name.localeCompare(b.name);
			} else {
				return b.name.localeCompare(a.name);
			}
		});

	const changeSortOrder = () => {
		const newSortOrder = sortOrder === 'ascend' ? 'descend' : 'ascend';
		setSortOrder(newSortOrder);
	};

	return (
		<Form {...layout} labelAlign="left" form={form} onFinish={onSubmit}>
			<div style={{ marginBottom: 20 }}>
				<Input
					placeholder="Search by Name"
					value={nameFilter}
					onChange={e => setNameFilter(e.target.value)}
					style={{ width: 200, marginRight: 8 }}
				/>
				<Select
					placeholder="Filter by Role"
					style={{ width: 120, marginRight: 8 }}
					onChange={value => setRoleFilter(value)}
					allowClear>
					<Option value="">All Roles</Option>
					<Option value="HACKER">Hacker</Option>
					<Option value="JUDGE">Judge</Option>
					<Option value="ORGANIZER">Organizer</Option>
				</Select>
				<Button
					type="primary"
					onClick={() => {
						form.resetFields();
						setNameFilter('');
						setRoleFilter('');
					}}>
					Reset
				</Button>
				<Button type="primary" onClick={changeSortOrder} style={{ marginLeft: 8 }}>
					Sort by {sortOrder === 'ascend' ? 'A-Z' : 'Z-A'}
				</Button>
			</div>
			{filteredData.map(config => (
				<Form.Item
					name={config._id}
					// display name and email
					label={
						<div>
							<span className={styles[getThemedClass('manageUserPrimaryLabel', baseTheme)]}>
								<Highlighter
									highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
									searchWords={[nameFilter]}
									autoEscape={true}
									textToHighlight={config.name}
								/>
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
