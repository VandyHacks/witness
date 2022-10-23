import { useEffect, useState } from 'react';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, DatePicker, Divider, Form, Input, Radio, Row, Skeleton, Table, Upload, UploadFile } from 'antd';
import useSWR from 'swr';
import TeamManager from '../components/TeamManager';
import TeamSetup from '../components/TeamSetup';
import { TeamProfile } from '../types/client';
import { ApplicationStatus, UserData, JudgingSessionData } from '../types/database';
import styles from '../styles/Form.module.css';
import { signOut, useSession } from 'next-auth/react';
import moment from 'moment';
import TextArea from 'antd/lib/input/TextArea';
import { Content } from 'antd/lib/layout/layout';
import { ColumnsType } from 'antd/es/table';

type HackerProps = {
	userApplicationStatus?: number;
	setUserApplicationStatus?: (newType: number) => void;
};
export default function HackerDash({ userApplicationStatus, setUserApplicationStatus }: HackerProps) {
	const [loading, setLoading] = useState(false);
	const { data: session, status } = useSession();
	const { data: teamData, error: teamError } = useSWR('/api/team-management', async url => {
		const res = await fetch(url, { method: 'GET' });
		if (!res.ok) return;
		const { members, ...rest } = await res.json();

		return { members: members.map((member: any) => member.name), ...rest } as TeamProfile;
	});

	const { data: user } = useSWR(
		'/api/user-data',
		async url => {
			const res = await fetch(url, { method: 'GET' });
			return (await res.json()) as UserData;
		},
		{ revalidateOnFocus: false, revalidateOnMount: true }
	);

	if (user?.applicationStatus) {
		setUserApplicationStatus?.(user.applicationStatus);
	}

	const onFinish = async (values: any) => {
		setLoading(true);
		await fetch('/api/apply', {
			method: 'POST',
			body: JSON.stringify(values),
		});
		// submit resume file
		if (values.resume) {
			const formData = new FormData();
			formData.append('resume', resumeToUpload);
			await fetch('/api/upload-resume', {
				method: 'POST',
				body: formData,
			});
		}
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

	function disabledDate(current: moment.Moment): boolean {
		// disable all dates from 18 years ago onwards
		return current && current > moment().subtract(18, 'years');
	}

	const [resumeFile, setResumeFile] = useState<UploadFile[]>([]);
	const [resumeToUpload, setResumeToUpload] = useState<string | Blob>('');

	// Create dummyRequest to prevent antd from sending POST request immediately after upload
	const dummyRequest = (options: any) => {
		setResumeToUpload(options.file);
		setTimeout(() => {
			options.onSuccess('ok');
		}, 0);
	};

	const onUploadChange = (info: any) => {
		let { fileList } = info;
		// if (info.file.status === 'uploading') {
		// 	console.log("uploading");
		// } else if (info.file.status === 'done') {
		// 	console.log("done");
		// }
		setResumeFile(fileList);
	};

	const onUploadRemove = (file: any) => {
		// console.log('removing');
		setResumeFile([]);
	};

	const confirmDecline = async (status: ApplicationStatus) => {
		setLoading(true);
		console.log('Confirming');
		await fetch('/api/confirm-decline', {
			method: 'POST',
			body: JSON.stringify({ applicationStatus: status }),
		});
		window.location.reload();
	};

	const judgingSessionColumns: ColumnsType<JudgingSessionData> = [
		{
			title: 'Time',
			dataIndex: 'time',
			key: 'name',
			width: '25vw',
			render: time => {
				let startTime = new Date(time);
				// add 10 minutes
				let endTime = new Date(startTime.getTime() + 10 * 60000);
				// return <>{startTime.getHours()}:{startTime.getMinutes()} - {endTime.getHours()}:{endTime.getMinutes()}</>
				return <>
					{startTime.toLocaleTimeString('default', {
						hour: '2-digit',
						minute: '2-digit'
					})} - {endTime.toLocaleTimeString('default', {
						hour: '2-digit',
						minute: '2-digit'
					})}</>
					;
			}
		},
		{
			title: 'Table',
			dataIndex: 'team',
			key: 'team',
			width: '25vw',
			render: loc => <>{loc.locationNum}</>
		},
		{
			title: 'Judge',
			dataIndex: 'judge',
			key: 'judge',
			width: '50vw',
			render: judge => <>{judge.name}</>
		}
	];

	const [judgingSessionData, setJudgingSessionData] = useState<JudgingSessionData[]>();

	const getJudgingSessionData = () => {
		fetch('/api/judging-sessions')
			.then(res => res.json())
			.then(data => {
				setJudgingSessionData(data);
			})
	}

	useEffect(() => {
		getJudgingSessionData();
	}, []);

	return (
		<Content
			style={{
				width: '100vw',
				height: '100%',
				padding: '30px',
				backgroundImage: `${user?.applicationStatus === ApplicationStatus.CONFIRMED ||
					user?.applicationStatus === ApplicationStatus.CHECKED_IN
					? 'url(background-2.png)'
					: user?.applicationStatus != null
						? 'url(background-1.png)'
						: ''
					}`,
				backgroundRepeat: 'no-repeat',
				backgroundPosition: `center`,
				backgroundAttachment: 'fixed',
				backgroundSize: 'cover',
			}}>
			{!user && <Skeleton />}
			{user && (
				<div style={{ overflow: 'auto' }}>
					<Form.Item className={styles.Title}> </Form.Item>

					{user.applicationStatus === ApplicationStatus.CREATED && (
						<Form layout={'vertical'} onFinish={onFinish} scrollToFirstError={true}>
							<div className={styles.Form}>
								<div
									style={{
										width: '100%',
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
										marginBottom: '30px',
									}}>
									<div style={{ paddingRight: '20px' }}>Signed in as {session?.user?.email}</div>
									<Button size="small" type="default" onClick={() => signOut()}>
										Sign out
									</Button>
								</div>
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
								<Form.Item
									name="dateOfBirth"
									label="Date of Birth"
									rules={[{ required: true, message: 'Please select your date of birth!' }]}>
									<DatePicker
										disabledDate={disabledDate}
										placeholder="MM-DD-YYYY"
										format="MM-DD-YYYY"
										defaultPickerValue={moment().subtract(18, 'years')}
									/>
								</Form.Item>
								<Form.Item
									label="Phone Number"
									name="phoneNumber"
									rules={[{ required: true, message: 'Please input your phone number!' }]}>
									<Input className={styles.Input} />
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
									label="Address Line 1"
									name="address1"
									rules={[{ required: true, message: 'Please input your address!' }]}>
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item label="Address Line 2" name="address2">
									<Input className={styles.Input} />
								</Form.Item>
								<div className={styles.InputAddress}>
									<Col span={10} className={styles.Col}>
										<Form.Item
											label="City"
											name={'city'}
											rules={[{ required: true, message: 'Please input your city!' }]}>
											<Input className={styles.Input + ' ' + styles.InputCity} />
										</Form.Item>
									</Col>
									<Col span={4} className={styles.Col}>
										<Form.Item
											label="State"
											name={'state'}
											rules={[{ required: true, message: 'Please input your state!' }]}>
											<Input className={styles.Input + ' ' + styles.InputState} />
										</Form.Item>
									</Col>
									<Col span={8} className={styles.Col}>
										<Form.Item
											label="ZIP Code"
											name={'zip'}
											rules={[
												{
													validator: (_, value) => {
														return new Promise((res, rej) => {
															const val = parseInt(value);
															if (isNaN(val)) rej();
															else if (val < 501 || val > 99999) rej();
															else if (value.length !== 5) rej();
															else res(null);
														});
													},
													message: 'Please input a valid 5 digit zip code!',
												},
											]}>
											<Input className={styles.Input + ' ' + styles.InputZip} />
										</Form.Item>
									</Col>
								</div>
								<Form.Item
									name="race"
									label="Race"
									rules={[{ required: true, message: 'Please select at least one option!' }]}>
									<Checkbox.Group options={race} />
								</Form.Item>
								<Form.Item name="dietaryRestrictions" label="Dietary Restrictions">
									<Checkbox.Group options={dietaryRestrictions} />
								</Form.Item>
								<Form.Item name="accommodationNeeds" label="Do you have any accommodation needs?">
									<Input placeholder="Enter your accommodation needs, if any" />
								</Form.Item>
								<Form.Item
									name="firstTime"
									label="Are you a first-time hacker?"
									rules={[{ required: true, message: 'Please select an option!' }]}
									tooltip="Beginner hackers are warmly welcomed!">
									<Radio.Group>
										<Radio.Button value="yes">Yes</Radio.Button>
										<Radio.Button value="no">No</Radio.Button>
									</Radio.Group>
								</Form.Item>
								<Form.Item
									name="whyAttend"
									label="Why would you like to attend VandyHacks?"
									rules={[
										{
											required: true,
											message: 'Please tell us why you want to attend VandyHacks!',
										},
									]}>
									<TextArea autoSize={{ minRows: 3 }} placeholder="Enter your response" />
								</Form.Item>
								<Form.Item
									name="techIndustry"
									label="Which tech industry, if any, do you want to get into?"
									rules={[{ required: true, message: 'Please enter your response!' }]}>
									<TextArea autoSize={{ minRows: 3 }} placeholder="Enter your response" />
								</Form.Item>
								<Form.Item
									name="techStack"
									label="Which tech stack, if any, are you familiar with?"
									rules={[{ required: true, message: 'Please enter your response!' }]}>
									<TextArea autoSize={{ minRows: 3 }} placeholder="Enter your response" />
								</Form.Item>
								<Form.Item
									name="passion"
									label="What are you passionate about?"
									rules={[
										{ required: true, message: 'Please tell us what you are passionate about :)' },
									]}>
									<TextArea autoSize={{ minRows: 3 }} placeholder="Enter your response" />
								</Form.Item>
								<Form.Item
									name="motivation"
									label="What do you hope to gain from VandyHacks?"
									rules={[{ required: true, message: 'Please select at least one option!' }]}>
									<Checkbox.Group options={motivation} />
								</Form.Item>
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
								<Form.Item
									label={'Résumé (will be shared with sponsors)'}
									rules={[
										{
											required: true,
											validator(rule, value, callback) {
												if (value && value.fileList.length > 0) {
													const file = value.fileList[0].originFileObj;
													if (!file) {
														callback('Please upload your résumé!');
													} else if (file.size > 1000000) {
														callback('File must be smaller than 1MB!');
													} else if (!file.type.includes('pdf')) {
														callback('File must be a PDF!');
													} else {
														callback();
													}
												} else {
													callback('Please upload your résumé!');
												}
											},
										},
									]}
									name="resume"
									valuePropName="resume">
									<Upload
										name="resume"
										customRequest={dummyRequest}
										listType="picture"
										accept=".pdf"
										maxCount={1}
										fileList={resumeFile}
										onChange={onUploadChange}
										onRemove={onUploadRemove}>
										<Button icon={<UploadOutlined />}>Upload Résumé (PDF only)</Button>
									</Upload>
								</Form.Item>
								{/* <Form.Item
									label="Would you like to apply for travel reimbursements? "
									name="applyTravelReimbursement"
									rules={[{ required: true, message: 'Please select an answer!' }]}>
									<Radio.Group>
										<Radio.Button value="yes">Yes</Radio.Button>
										<Radio.Button value="no">No</Radio.Button>
									</Radio.Group>
								</Form.Item> */}
								<Form.Item
									name="overnight"
									label="Will you be staying overnight in the venue and thus need access to shower?"
									rules={[{ required: true, message: 'Please select an answer!' }]}>
									<Radio.Group>
										<Radio.Button value="yes">Yes</Radio.Button>
										<Radio.Button value="no">No</Radio.Button>
									</Radio.Group>
								</Form.Item>
								<Form.Item
									name="prizeEligibility"
									label="Are you a U.S. Citizen, Permanent Resident, or granted the status of Immigrant, Refugee, Asylee or Deferred Action for Childhood Arrival (DACA), by the Bureau of Citizenship and Immigration Services?"
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
											style={{ color: '#027cff' }}
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
											style={{ color: '#027cff' }}
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
								<Form.Item valuePropName="checked" name="mlhComms">
									<Checkbox>
										I authorize MLH to send me an email where I can further opt into the MLH Hacker,
										Events, or Organizer Newsletters and other communications from MLH.
									</Checkbox>
								</Form.Item>
								<br />

								<Button
									loading={loading}
									style={{ marginBottom: '60px' }}
									type="primary"
									htmlType="submit">
									Submit
								</Button>
								<br />
							</div>
						</Form>
					)}
					{user.applicationStatus === ApplicationStatus.SUBMITTED && (
						<>
							<div className={styles.SubmittedForm}>
								<div className={styles.ThankYouMessage}>
									Thank you for applying to VandyHacks!
									<br />
									You will hear back from us soon :&#41;
									<br />
									<br />
									In the meantime, follow us on{' '}
									<a
										href="https://www.instagram.com/vandyhacks"
										target="_blank"
										rel="noreferrer"
										style={{ color: '#0000EE' }}>
										Instagram
									</a>{' '}
									to stay updated on our news and announcements!
									<div className={styles.SignInInfo}>
										<div>Signed in as {session?.user?.email}</div>
										<Button
											style={{ marginTop: '8px' }}
											size="small"
											type="default"
											onClick={() => signOut()}>
											Sign out
										</Button>
									</div>
								</div>
							</div>
						</>
					)}
					{user.applicationStatus === ApplicationStatus.ACCEPTED && (
						<>
							<div className={styles.SubmittedForm}>
								<div className={styles.ThankYouMessage}>
									Congratulations!
									<br />
									You have been accepted to VandyHacks!
									<br />
									<br />
									Click below to accept or reject your position at VandyHacks as soon as possible.
									<div style={{ paddingTop: '10px' }}>
										<Button onClick={() => confirmDecline(ApplicationStatus.CONFIRMED)}>
											Confirm
										</Button>
										&nbsp;&nbsp;
										<Button onClick={() => confirmDecline(ApplicationStatus.DECLINED)}>
											Decline
										</Button>
									</div>
									<div className={styles.SignInInfo}>
										<div>Signed in as {session?.user?.email}</div>
										<Button
											style={{ marginTop: '8px' }}
											size="small"
											type="default"
											onClick={() => signOut()}>
											Sign out
										</Button>
									</div>
								</div>
							</div>
						</>
					)}
					{(user.applicationStatus === ApplicationStatus.CONFIRMED ||
						user.applicationStatus === ApplicationStatus.CHECKED_IN) && (
							<>
								{/* Hacking start code */}
								<div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '10px' }}>
									<Button size="small" type="default" onClick={() => signOut()}>
										Sign out
									</Button>
									<div style={{ paddingLeft: '10px' }}>Signed in as {session?.user?.email}</div>
								</div>
								{!teamData && <TeamSetup />}
								{teamData &&
									<>
										<Content style={{ width: '60vw', margin: 'auto' }}>
											<Table columns={judgingSessionColumns} dataSource={judgingSessionData} />
										</Content>
										<Divider />
										<TeamManager profile={teamData} />
									</>
								}
								{/* Pre-hacking code */}
								{/*
							<div className={styles.SubmittedForm}>
								<div className={styles.ThankYouMessage}>
									Congratulations!
									<br />
									You have been accepted to VandyHacks!
									<div style={{ width: '100%', height: '16px' }}></div>
									<a href="https://vhl.ink/discord" target="_blank" rel="noreferrer">
										<Button size="large" type="link">
											Click here to join our Discord
										</Button>
									</a>
									<br />
									<br />
									More information will appear here as we get closer to the hackathon!
									<div className={styles.SignInInfo}>
										<div>Signed in as {session?.user?.email}</div>
										<Button
											style={{ marginTop: '8px' }}
											size="small"
											type="default"
											onClick={() => signOut()}>
											Sign out
										</Button>
									</div>
								</div>
							</div>
							*/}
							</>
						)}
					{user.applicationStatus === ApplicationStatus.REJECTED && (
						<>
							<div className={styles.SubmittedForm}>
								<div className={styles.ThankYouMessage}>
									<br />
									Unfortunately, your application to VandyHacks has been rejected. We hope you apply
									again next year!
									<br />
									<div className={styles.SignInInfo}>
										<div>Signed in as {session?.user?.email}</div>
										<Button
											style={{ marginTop: '8px' }}
											size="small"
											type="default"
											onClick={() => signOut()}>
											Sign out
										</Button>
									</div>
								</div>
							</div>
						</>
					)}
					{user.applicationStatus === ApplicationStatus.DECLINED && (
						<>
							<div className={styles.SubmittedForm}>
								<div className={styles.ThankYouMessage}>
									<br />
									We&apos;re sorry to see you declined your spot at VandyHacks. If this was a mistake
									and you&apos;d like to attend, please email us at{' '}
									<a style={{ color: 'blue' }} href="mailto:info@vandyhacks.org">
										info@vandyhacks.org
									</a>
									.
									<br />
									We hope to see you next year!
									<br />
									<div className={styles.SignInInfo}>
										<div>Signed in as {session?.user?.email}</div>
										<Button
											style={{ marginTop: '8px' }}
											size="small"
											type="default"
											onClick={() => signOut()}>
											Sign out
										</Button>
									</div>
								</div>
							</div>
						</>
					)}
				</div>
			)}
		</Content>
	);
}
