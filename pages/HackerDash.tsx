import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, DatePicker, Form, Input, Radio, Row, Skeleton, Upload } from 'antd';
import { useState } from 'react';
import useSWR from 'swr';
import TeamManager from '../components/TeamManager';
import TeamSetup from '../components/TeamSetup';
import { TeamProfile } from '../types/client';
import { ApplicationStatus, UserData } from '../types/database';

export default function HackerDash() {
	const [loading, setLoading] = useState(false);
	const { data: teamData, error: teamError } = useSWR('/api/team-management', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) return;
		const { members, ...rest } = await res.json();

		return { members: members.map((member: any) => member.name), ...rest } as TeamProfile;
	});

	const { data: user } = useSWR('/api/user-data', async url => {
		const res = await fetch(url, { method: 'GET' });
		return (await res.json()) as UserData;
	});

	const onFinish = async (values: any) => {
		setLoading(true);
		console.log(values);
		/*await fetch('/api/apply', {
			method: 'POST',
			body: JSON.stringify(values),
		});*/
		//window.location.reload();
	};

	const dietaryRestrictions = [
		{ label: 'Gluten Free', value: 'glutenFree' },
		{ label: 'Vegetarian', value: 'vegetarian' },
		{ label: 'Vegan', value: 'vegan' },
		{ label: 'Lactose Intolerant', value: 'lactose' },
		{ label: 'Nut Allergy', value: 'nut' },
		{ label: 'Halal', value: 'halal' },
		{ label: 'Kosher', value: 'kosher' },
	];

	const race = [
		{ label: 'White', value: 'white' },
		{ label: 'Black or African American', value: 'vegan' },
		{ label: 'American Indian or Alaskan Native', value: 'glutenFree' },
		{ label: 'Asian', value: 'vegetarian' },
		{ label: 'Native Hawaiian or Other Pacific Islander', value: 'pacific' },
		{ label: 'Other', value: 'other' },
		{ label: 'Prefer Not To Answer', value: 'noAnswer' },
	];

	const motivation = [
		{ label: 'Get an intro to coding', value: 'intro' },
		{ label: 'Create a project', value: 'project' },
		{ label: 'Have some fun with other people in the tech community', value: 'fun' },
		{ label: 'Internship opportunities', value: 'internships' },
		{ label: 'Other', value: 'other' },
	];

	return (
		<>
			{!user && <Skeleton />}
			{user && (
				<>
					{user.applicationStatus === ApplicationStatus.CREATED && (
						<Form layout={'vertical'} onFinish={onFinish}>
							<Form.Item
								label="First Name"
								name="firstName"
								rules={[{ required: true, message: 'Please input your first name!' }]}>
								<Input />
							</Form.Item>
							<Form.Item
								label="Last Name"
								name="lastName"
								rules={[{ required: true, message: 'Please input your last name!' }]}>
								<Input />
							</Form.Item>
							<Form.Item label="Preferred Name" name="preferredName">
								<Input />
							</Form.Item>
							<Form.Item
								label="Phone Number"
								name="phoneNumber"
								rules={[{ required: true, message: 'Please input your phone number!' }]}>
								<Input />
							</Form.Item>
							<Form.Item label="Gender" name="gender" rules={[{ required: true }]}>
								<Radio.Group>
									<Radio.Button value="female">Female</Radio.Button>
									<Radio.Button value="male">Male</Radio.Button>
									<Radio.Button value="other">Other</Radio.Button>
									<Radio.Button value="preferNotToSay">Prefer Not to Say</Radio.Button>
								</Radio.Group>
							</Form.Item>
							<Form.Item name="dietaryRestrictions" label="Dietary Restrictions">
								<Checkbox.Group options={dietaryRestrictions} />
							</Form.Item>
							<Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true }]}>
								<DatePicker />
							</Form.Item>
							<Form.Item
								label="School"
								name="school"
								rules={[{ required: true, message: 'Please input your school!' }]}>
								<Input />
							</Form.Item>
							<Form.Item
								label="Major"
								name="major"
								rules={[{ required: true, message: 'Please input your major!' }]}>
								<Input />
							</Form.Item>
							<Form.Item label="Graduation Year" name="gradYear" rules={[{ required: true }]}>
								<Radio.Group>
									<Radio.Button value="2023">2023</Radio.Button>
									<Radio.Button value="2024">2024</Radio.Button>
									<Radio.Button value="2025">2025</Radio.Button>
									<Radio.Button value="2026">2026</Radio.Button>
									<Radio.Button value="other">Other</Radio.Button>
								</Radio.Group>
							</Form.Item>
							<Form.Item name="race" label="Race" rules={[{ required: true }]}>
								<Checkbox.Group options={race} />
							</Form.Item>
							<Form.Item
								name="motivation"
								label="What do you hope to gain from VandyHacks?"
								rules={[{ required: true }]}>
								<Checkbox.Group options={motivation} />
							</Form.Item>
							<Form.Item
								label="Will you be attending the hackathon in-person?"
								name="inPerson"
								rules={[{ required: true }]}>
								<Radio.Group>
									<Radio.Button value="yes">Yes</Radio.Button>
									<Radio.Button value="no">No</Radio.Button>
								</Radio.Group>
							</Form.Item>
							<Form.Item
								label="Would you like to be contacted about volunteering at the event?"
								name="volunteering"
								rules={[{ required: true }]}>
								<Radio.Group>
									<Radio.Button value="yes">Yes</Radio.Button>
									<Radio.Button value="no">No</Radio.Button>
								</Radio.Group>
							</Form.Item>
							<Form.Item rules={[{ required: true }]} name="resume" valuePropName="resume">
								<Upload
									name="resume"
									action="/api/upload-resume"
									listType="picture"
									accept=".pdf"
									maxCount={1}>
									<Button icon={<UploadOutlined />}>Click to Upload Résumé</Button>
								</Upload>
							</Form.Item>
							<Form.Item
								label="Address Line 1"
								name="addressLine1"
								rules={[{ required: true, message: 'Please input your phone number!' }]}>
								<Input />
							</Form.Item>
							<Form.Item label="Address Line 2" name="addressLine2">
								<Input />
							</Form.Item>
							<div style={{ display: "flex" }}>
								<Col span={16}>
									<Form.Item 
										label="City"
										name={"city"}
										rules={[{ required: true, message: 'Please input your city!' }]}
									>
									<Input style={{width: "90%"}} />
									</Form.Item>
								</Col>
								<Col span={4}>
									<Form.Item 
										label="State"
										name={"state"}
										rules={[{ required: true, message: 'Please input your state!' }]}
									>
										<Input style={{width: "80%"}} />
									</Form.Item>
								</Col>
								<Col span={4}>
									<Form.Item 
										label="ZIP Code"
										name={"zip"}
										rules={[{ required: true, message: 'Please input your zip code!' }]}
									>
										<Input />
									</Form.Item>
								</Col>
							</div>

							<Form.Item>
								<Button loading={loading} type="primary" htmlType="submit">
									Submit
								</Button>
							</Form.Item>
						</Form>
					)}
					{user.applicationStatus === ApplicationStatus.SUBMITTED && <p>Submitted!</p>}
					{user.applicationStatus === ApplicationStatus.ACCEPTED && (
						<>
							{!teamData && <TeamSetup />}
							{teamData && <TeamManager profile={teamData} />}
						</>
					)}
				</>
			)}
		</>
	);
}
