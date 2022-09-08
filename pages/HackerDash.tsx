import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, DatePicker, Form, Input, Radio, Row, Skeleton, Upload } from 'antd';
import { useState } from 'react';
import useSWR from 'swr';
import TeamManager from '../components/TeamManager';
import TeamSetup from '../components/TeamSetup';
import { TeamProfile } from '../types/client';
import { ApplicationStatus, UserData } from '../types/database';
import styles from '../styles/Form.module.css';

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
		await fetch('/api/apply', {
			method: 'POST',
			body: JSON.stringify(values),
		});
		window.location.reload();
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
		{ label: 'Black or African American', value: 'black' },
		{ label: 'American Indian or Alaskan Native', value: 'native' },
		{ label: 'Asian', value: 'asian' },
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
					<Form.Item className={styles.Title}> </Form.Item>

					{user.applicationStatus === ApplicationStatus.CREATED && (
						<Form layout={'vertical'} onFinish={onFinish}>
							{/* <img src="form-title.png"/> */}
							<div className={styles.Form}>
								{/* <img src="/form-title.png" className="dasCrazy" style={{width: '60%'}}/> */}
								<Form.Item
									label="First Name"
									name="firstName"
									rules={[{ required: true, message: 'Please input your first name!' }]}>
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item
									label="Last Name"
									name="lastName"
									rules={[{ required: true, message: 'Please input your last name!' }]}>
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item label="Preferred Name" name="preferredName">
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item
									label="Phone Number"
									name="phoneNumber"
									rules={[{ required: true, message: 'Please input your phone number!' }]}>
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item
									label="Gender"
									name="gender"
									rules={[{ required: true, message: 'Please select an option!' }]}>
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
								<Form.Item
									name="dateOfBirth"
									label="Date of Birth"
									rules={[{ required: true, message: 'Please select your date of birth!' }]}>
									<DatePicker />
								</Form.Item>
								<Form.Item
									label="School"
									name="school"
									rules={[{ required: true, message: 'Please input your school!' }]}>
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item
									label="Major"
									name="major"
									rules={[{ required: true, message: 'Please input your major!' }]}>
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item
									label="Graduation Year"
									name="graduationYear"
									rules={[{ required: true, message: 'Please select your graduation year!' }]}>
									<Radio.Group>
										<Radio.Button value="2023">2023</Radio.Button>
										<Radio.Button value="2024">2024</Radio.Button>
										<Radio.Button value="2025">2025</Radio.Button>
										<Radio.Button value="2026">2026</Radio.Button>
										<Radio.Button value="other">Other</Radio.Button>
									</Radio.Group>
								</Form.Item>
								<Form.Item
									name="race"
									label="Race"
									rules={[{ required: true, message: 'Please select at least one option!' }]}>
									<Checkbox.Group options={race} />
								</Form.Item>
								<Form.Item
									name="motivation"
									label="What do you hope to gain from VandyHacks?"
									rules={[{ required: true, message: 'Please select at least one option!' }]}>
									<Checkbox.Group options={motivation} />
								</Form.Item>
								<Form.Item
									label="Will you be attending the hackathon in-person?"
									name="attendingInPerson"
									rules={[{ required: true, message: 'Please select an answer!' }]}>
									<Radio.Group>
										<Radio.Button value="yes">Yes</Radio.Button>
										<Radio.Button value="no">No</Radio.Button>
									</Radio.Group>
								</Form.Item>
								<Form.Item
									label="Would you like to be contacted about volunteering at the event?"
									name="volunteer"
									rules={[{ required: true, message: 'Please select an answer!' }]}>
									<Radio.Group>
										<Radio.Button value="yes">Yes</Radio.Button>
										<Radio.Button value="no">No</Radio.Button>
									</Radio.Group>
								</Form.Item>
								<Form.Item
									label={'Résumé (will be shared with sponsors)'}
									rules={[{ required: true, message: 'Please upload your résumé!' }]}
									name="resume"
									valuePropName="resume">
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
									name="address1"
									rules={[{ required: true, message: 'Please input your address!' }]}>
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item label="Address Line 2" name="address2">
									<Input className={styles.Input} />
								</Form.Item>
								<div style={{ display: 'flex' }}>
									<Col span={16}>
										<Form.Item
											label="City"
											name={'city'}
											rules={[{ required: true, message: 'Please input your city!' }]}>
											<Input className={styles.Input + ' ' + styles.InputCity} />
										</Form.Item>
									</Col>
									<Col span={4}>
										<Form.Item
											label="State"
											name={'state'}
											rules={[{ required: true, message: 'Please input your state!' }]}>
											<Input className={styles.Input + ' ' + styles.InputState} />
										</Form.Item>
									</Col>
									<Col span={4}>
										<Form.Item
											label="ZIP Code"
											name={'zip'}
											rules={[{ required: true, message: 'Please input your zip code!' }]}>
											<Input className={styles.Input} />
										</Form.Item>
									</Col>
								</div>

								<Form.Item
									label="Shirt Size"
									name="shirtSize"
									rules={[{ required: true, message: 'Please select your shirt size!' }]}>
									<Radio.Group>
										<Radio.Button value="XS">XS</Radio.Button>
										<Radio.Button value="S">S</Radio.Button>
										<Radio.Button value="M">M</Radio.Button>
										<Radio.Button value="L">L</Radio.Button>
										<Radio.Button value="XL">XL</Radio.Button>
										<Radio.Button value="XXL">XXL</Radio.Button>
									</Radio.Group>
								</Form.Item>
								<br />
								<Form.Item
									valuePropName="checked"
									name="agreement1"
									rules={[
										{
											validator: (_, value) =>
												value
													? Promise.resolve()
													: Promise.reject(new Error('Please read and agree to submit.')),
										},
									]}>
									<Checkbox>
										I have read and agree to the{' '}
										<a
											target="_blank"
											rel="noopener noreferrer"
											href="https://static.mlh.io/docs/mlh-code-of-conduct.pdf">
											MLH Code of Conduct
										</a>
										.
									</Checkbox>
								</Form.Item>
								<Form.Item
									valuePropName="checked"
									name="agreement2"
									rules={[
										{
											validator: (_, value) =>
												value
													? Promise.resolve()
													: Promise.reject(new Error('Please read and agree to submit.')),
										},
									]}>
									<Checkbox>
										I authorize you to share my application/registration information for event
										administration, ranking, MLH administration, pre- and post-event informational
										emails, and occasional emails about hackathons in line with the MLH Privacy
										Policy. I further agree to the terms of both the{' '}
										<a
											target="_blank"
											rel="noopener noreferrer"
											href="https://github.com/MLH/mlh-policies/tree/master/prize-terms-and-conditions">
											MLH Contest Terms and Conditions
										</a>{' '}
										and the{' '}
										<a target="_blank" rel="noopener noreferrer" href="https://mlh.io/privacy">
											MLH Privacy Policy
										</a>
										.
									</Checkbox>
								</Form.Item>
								<br />
							</div>

							<button className={styles.Submit} type="submit" />
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
