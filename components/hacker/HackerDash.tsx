import { useEffect, useState } from 'react';
import { BugOutlined, UploadOutlined } from '@ant-design/icons';
import {
	AutoComplete,
	Button,
	Checkbox,
	DatePicker,
	Dropdown,
	Form,
	Input,
	Radio,
	Skeleton,
	Upload,
	UploadFile,
} from 'antd';
import useSWR from 'swr';
import Leaderboard from './Leaderboard';
import JudgingSchedule from './JudgingSchedule';
import { TeamProfile } from '../../types/client';
import { ApplicationStatus, UserData, JudgingSessionData, HackathonSettingsData } from '../../types/database';
import styles from '../../styles/Form.module.css';
import { signOut, useSession } from 'next-auth/react';
import TextArea from 'antd/lib/input/TextArea';
import { Content } from 'antd/lib/layout/layout';
import Header from './hacking-start/Header';
import RegistrationLogo from './RegistrationLogo';
import TeamManagement from './hacking-start/TeamManagement';
import Link from 'next/link';

const DEV_DEPLOY =
	process.env.NODE_ENV === 'development' || ['preview', 'development'].includes(process.env.NEXT_PUBLIC_VERCEL_ENV!); // frontend env variable

type HackerProps = {
	userApplicationStatus: number;
	setUserApplicationStatus: (newType: number) => void;
};

type DropdownItem = {
	label: string;
	value: string;
};

export default function HackerDash({ userApplicationStatus, setUserApplicationStatus }: HackerProps) {
	const [loading, setLoading] = useState(false);
	const { data: session, status } = useSession();

	const { data: user } = useSWR(
		'/api/user-data',
		async url => {
			const res = await fetch(url, { method: 'GET' });
			return (await res.json()) as UserData;
		},
		{ revalidateOnFocus: false, revalidateOnMount: true }
	);

	const { data: setting } = useSWR(
		'/api/hackathon-settings',
		async url => {
			const res = await fetch(url, { method: 'GET' });

			const hackathongSetting = (await res.json()) as HackathonSettingsData;
			const hackathonStartDate = new Date(Date.parse(hackathongSetting.HACKATHON_START));
			const hackathonEndDate = new Date(Date.parse(hackathongSetting.HACKATHON_END));
			const curDate = new Date();

			// DEV_DEPLOY is true if we are in development or preview mode
			if (DEV_DEPLOY) {
				setHackathonStarted(true);
			} else {
				setHackathonStarted(curDate >= hackathonStartDate);
			}

			return hackathongSetting;
		},
		{ revalidateOnFocus: false, revalidateOnMount: true }
	);

	// get country options
	const [countryOptions, setCountryOptions] = useState([]);
	const [country, setCountry] = useState('');
	const { data: countries } = useSWR(
		'https://restcountries.com/v3.1/all',
		async url => {
			const res = await fetch(url, { method: 'GET' });
			const jsonRes = await res.json();
			const countryList = jsonRes.map((country: any) => {
				return { label: country.name.common, value: country.name.common };
			});
			setCountryOptions(countryList);
			return countryList;
		},
		{ revalidateOnFocus: false, revalidateOnMount: true }
	);

	// get school options
	const [schoolOptions, setSchoolOptions] = useState<DropdownItem[]>([]);
	const [school, setSchool] = useState('');
	const { data: schools } = useSWR(
		'https://raw.githubusercontent.com/MLH/mlh-policies/main/schools.csv',
		async url => {
			const res = await fetch(url, { method: 'GET' });
			const csvText = await res.text();
			const schoolArr = csvText.split('\n').slice(1);

			const schoolList = schoolArr.map((school: string) => {
				return { label: school, value: school };
			});

			setSchoolOptions(schoolList);
			return schoolList;
		},
		{ revalidateOnFocus: false, revalidateOnMount: true }
	);

	const [hackathonStarted, setHackathonStarted] = useState(false);

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

	// Level of study provided by MLH
	const levelOfStudy = [
		{ label: 'Less than Secondary / High School', value: 'less_than_high_school' },
		{ label: 'Secondary / High School', value: 'high_school' },
		{ label: 'Undergraduate University (2 year - community college or similar)', value: 'undergrad_2_year' },
		{ label: 'Undergraduate University (3+ year)', value: 'undergrad_3_plus_year' },
		{ label: 'Graduate University (Masters, Professional, Doctoral, etc)', value: 'graduate_university' },
		{ label: 'Code School / Bootcamp', value: 'code_bootcamp' },
		{ label: 'Other Vocational / Trade Program or Apprenticeship', value: 'vocational_trade' },
		{ label: 'Post Doctorate', value: 'post_doctorate' },
		{ label: 'Other', value: 'other' },
		{ label: "I'm not currently a student", value: 'not_student' },
		{ label: 'Prefer not to answer', value: 'prefer_not_to_answer' },
	];

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

	const [judgingSessionData, setJudgingSessionData] = useState<JudgingSessionData[]>();

	const getJudgingSessionData = () => {
		fetch('/api/judging-sessions')
			.then(res => res.json())
			.then(data => {
				setJudgingSessionData(data);
			});
	};

	useEffect(() => {
		if (user?.applicationStatus) setUserApplicationStatus(user.applicationStatus);
		getJudgingSessionData();
	}, [setUserApplicationStatus, user?.applicationStatus]);

	return (
		<Content
			style={{
				width: '100vw',
				height: '100vh',
				backgroundImage: `${
					user?.applicationStatus === ApplicationStatus.CONFIRMED ||
					user?.applicationStatus === ApplicationStatus.CHECKED_IN
						? 'url(background-1.png)'
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
				<div style={{ overflow: 'auto', height: '100vh' }}>
					{user.applicationStatus === ApplicationStatus.CREATED && (
						<Form
							layout={'horizontal'}
							labelCol={{ span: 8 }}
							labelAlign="left"
							onFinish={onFinish}
							requiredMark={false}
							scrollToFirstError={true}>
							<div className={styles.Form}>
								<div className={styles.SignedInStatus}>
									<div style={{ paddingRight: '20px' }}>Signed in as {session?.user?.email}</div>
									<Button size="small" type="default" onClick={() => signOut()}>
										Sign out
									</Button>
								</div>
								<Form.Item
									label={<p className={styles.Label}>First Name</p>}
									name="firstName"
									rules={[{ required: true, message: 'Please input your first name!' }]}>
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item
									label={<p className={styles.Label}>Last Name</p>}
									name="lastName"
									rules={[{ required: true, message: 'Please input your last name!' }]}>
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item label={<p className={styles.Label}>Preferred Name</p>} name="preferredName">
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item
									label={<p className={styles.Label}>Gender</p>}
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
									name="age"
									label={<p className={styles.Label}>Age</p>}
									rules={[
										{
											required: true,
											message: 'Please input a valid age.',
											validator: (_, value) =>
												value && value > 0 && value < 150
													? Promise.resolve()
													: Promise.reject(new Error('Please input a valid age.')),
										},
									]}>
									<Input className={styles.Input} type="number" />
								</Form.Item>
								<Form.Item
									label={<p className={styles.Label}>Phone Number</p>}
									name="phoneNumber"
									rules={[{ required: true, message: 'Please input your phone number!' }]}>
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item
									label={<p className={styles.Label}>School</p>}
									name="school"
									rules={[{ required: true, message: 'Please input your school!' }]}>
									<AutoComplete
										options={schoolOptions}
										onSearch={text => {
											setSchoolOptions(
												schools?.filter((school: DropdownItem) =>
													school.label.toLowerCase().includes(text.toLowerCase())
												) || []
											);
										}}
										value={school}
										onChange={data => setSchool(data)}
										className={styles.Input}
									/>
								</Form.Item>
								<Form.Item
									label={<p className={styles.Label}>Major</p>}
									name="major"
									rules={[{ required: true, message: 'Please input your major!' }]}>
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item
									label={<p className={styles.Label}>Level of Study</p>}
									name="levelOfStudy"
									rules={[{ required: true, message: 'Please select your level of study!' }]}>
									<Radio.Group>
										{levelOfStudy.map((level: DropdownItem) => (
											<Radio.Button key={level.value} value={level.value}>
												{level.label}
											</Radio.Button>
										))}
									</Radio.Group>
								</Form.Item>
								<Form.Item
									label={<p className={styles.Label}>Graduation Year</p>}
									name="graduationYear"
									rules={[
										{ required: true, message: 'Please select the year you intend to graduate!' },
									]}>
									<Radio.Group>
										<Radio.Button value="2024">2024</Radio.Button>
										<Radio.Button value="2025">2025</Radio.Button>
										<Radio.Button value="2026">2026</Radio.Button>
										<Radio.Button value="2027">2027</Radio.Button>
										<Radio.Button value="2028">2028</Radio.Button>
										<Radio.Button value="2029">2029</Radio.Button>
										<Radio.Button value="other">Not sure/Other</Radio.Button>
									</Radio.Group>
								</Form.Item>
								<Form.Item
									label={<p className={styles.Label}>Address Line 1</p>}
									name="address1"
									rules={[{ required: true, message: 'Please input your address!' }]}>
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item label={<p className={styles.Label}>Address Line 2</p>} name="address2">
									<Input className={styles.Input} />
								</Form.Item>

								<Form.Item
									label={<p className={styles.Label}>City</p>}
									name={'city'}
									rules={[{ required: true, message: 'Please input your city!' }]}>
									<Input className={styles.Input} />
								</Form.Item>

								<Form.Item
									label={<p className={styles.Label}>State</p>}
									name={'state'}
									rules={[{ required: true, message: 'Please input your state!' }]}>
									<Input className={styles.Input} />
								</Form.Item>
								<Form.Item
									label={<p className={styles.Label}>ZIP Code</p>}
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
									<Input className={styles.Input} />
								</Form.Item>

								<Form.Item
									label={<p className={styles.Label}>Country</p>}
									name={'country'}
									rules={[{ required: true, message: 'Please input your country!' }]}>
									<AutoComplete
										options={countryOptions}
										onSearch={text => {
											setCountryOptions(
												countries.filter((country: DropdownItem) =>
													country.label.toLowerCase().includes(text.toLowerCase())
												)
											);
										}}
										value={country}
										onChange={data => setCountry(data)}
										className={styles.Input}
									/>
								</Form.Item>

								<Form.Item
									name="race"
									label={<p className={styles.Label}>Race</p>}
									rules={[{ required: true, message: 'Please select at least one option!' }]}>
									<Checkbox.Group className={styles.TextWhite} options={race} />
								</Form.Item>
								<Form.Item
									name="dietaryRestrictions"
									label={<p className={styles.Label}>Dietary Restrictions</p>}>
									<Checkbox.Group className={styles.TextWhite} options={dietaryRestrictions} />
								</Form.Item>
								<Form.Item
									name="accommodationNeeds"
									label={<p className={styles.Label}>Accommodation needs</p>}>
									<Input
										className={styles.FormInput}
										placeholder="Enter your accommodation needs, if any"
									/>
								</Form.Item>
								<Form.Item
									name="firstTime"
									label={<p className={styles.Label}>First-time hacker?</p>}
									rules={[{ required: true, message: 'Please select an option!' }]}
									tooltip="Beginner hackers are warmly welcomed!">
									<Radio.Group>
										<Radio.Button value="yes">Yes</Radio.Button>
										<Radio.Button value="no">No</Radio.Button>
									</Radio.Group>
								</Form.Item>
								<Form.Item
									name="whyAttend"
									label={<p className={styles.Label}>Why would you like to attend VandyHacks?</p>}
									rules={[
										{
											required: true,
											message: 'Please tell us why you want to attend VandyHacks!',
										},
									]}>
									<TextArea
										className={styles.FormInput}
										autoSize={{ minRows: 3 }}
										placeholder="Enter your response"
									/>
								</Form.Item>
								<Form.Item
									name="techIndustry"
									label={
										<p className={styles.Label}>
											Which tech industry, if any, do you want to get into?
										</p>
									}
									rules={[{ required: true, message: 'Please enter your response!' }]}>
									<TextArea
										className={styles.FormInput}
										autoSize={{ minRows: 3 }}
										placeholder="Enter your response"
									/>
								</Form.Item>
								<Form.Item
									name="techStack"
									label={
										<p className={styles.Label}>Which tech stack, if any, are you familiar with?</p>
									}
									rules={[{ required: true, message: 'Please enter your response!' }]}>
									<TextArea
										className={styles.FormInput}
										autoSize={{ minRows: 3 }}
										placeholder="Enter your response"
									/>
								</Form.Item>
								<Form.Item
									name="passion"
									label={<p className={styles.Label}>What are you passionate about?</p>}
									rules={[
										{ required: true, message: 'Please tell us what you are passionate about :)' },
									]}>
									<TextArea
										className={styles.FormInput}
										autoSize={{ minRows: 3 }}
										placeholder="Enter your response"
									/>
								</Form.Item>
								<Form.Item
									name="motivation"
									label={<p className={styles.Label}>What do you hope to gain from VandyHacks?</p>}
									rules={[{ required: true, message: 'Please select at least one option!' }]}>
									<Checkbox.Group className={styles.TextWhite} options={motivation} />
								</Form.Item>
								<Form.Item
									label={<p className={styles.Label}>Shirt Size</p>}
									name="shirtSize"
									rules={[{ required: true, message: 'Please select your shirt size!' }]}>
									<Radio.Group className={styles.RadioGroup}>
										<Radio.Button value="XS">XS</Radio.Button>
										<Radio.Button value="S">S</Radio.Button>
										<Radio.Button value="M">M</Radio.Button>
										<Radio.Button value="L">L</Radio.Button>
										<Radio.Button value="XL">XL</Radio.Button>
										<Radio.Button value="XXL">XXL</Radio.Button>
									</Radio.Group>
								</Form.Item>
								<Form.Item
									label={<p className={styles.Label}>Résumé</p>}
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
										<Button icon={<UploadOutlined />}>Upload résumé (PDF only)</Button>
									</Upload>
								</Form.Item>
								{/* TODO: create a new time in hackathon-settings db collection for applyTravelReimbursement end date */}
								{/* <Form.Item
									label={
										<p className={styles.Label}>
											Would you like to apply for travel reimbursements?
										</p>
									}
									name="applyTravelReimbursement"
									rules={[{ required: true, message: 'Please select an answer!' }]}>
									<Radio.Group>
										<Radio.Button value="yes">Yes</Radio.Button>
										<Radio.Button value="no">No</Radio.Button>
									</Radio.Group>
								</Form.Item> */}
								<Form.Item
									name="overnight"
									label={
										<p className={styles.LabelOvernight}>Are you staying overnight in the venue?</p>
									}
									rules={[{ required: true, message: 'Please select an answer!' }]}>
									<Radio.Group className={styles.RadioGroup}>
										<Radio.Button value="yes">Yes</Radio.Button>
										<Radio.Button value="no">No</Radio.Button>
									</Radio.Group>
								</Form.Item>
								<Form.Item
									name="prizeEligibility"
									label={
										<p className={styles.LabelCitizen}>
											Are you a U.S. Citizen, Permanent Resident, or granted the status of
											Immigrant, Refugee, Asylee or Deferred Action for Childhood Arrival (DACA),
											by the Bureau of Citizenship and Immigration Services?
										</p>
									}
									rules={[{ required: true, message: 'Please select an answer!' }]}>
									<Radio.Group className={styles.RadioGroup}>
										<Radio.Button value="yes">Yes</Radio.Button>
										<Radio.Button value="no">No</Radio.Button>
									</Radio.Group>
								</Form.Item>
								<Form.Item
									label={
										<p className={styles.LabelContact}>
											Would you like to be contacted about volunteering at the event?
										</p>
									}
									name="volunteer"
									rules={[{ required: true, message: 'Please select an answer!' }]}>
									<Radio.Group className={styles.RadioGroup}>
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
									<Checkbox style={{ color: 'white' }}>
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
									<Checkbox style={{ color: 'white' }}>
										I authorize you to share my application/registration information with Major
										League Hacking for event administration, ranking, and MLH administration in-line
										with the{' '}
										<a target="_blank" rel="noopener noreferrer" href="https://mlh.io/privacy">
											MLH Privacy Policy.
										</a>{' '}
										I further agree to the terms of both the{' '}
										<a
											style={{ color: '#027cff' }}
											target="_blank"
											rel="noopener noreferrer"
											href="https://github.com/MLH/mlh-policies/blob/main/contest-terms.md">
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
									<Checkbox style={{ color: 'white' }}>
										I authorize MLH to send me occasional emails about relevant events, career
										opportunities, and community announcements.
									</Checkbox>
								</Form.Item>
								<br />

								<Button
									loading={loading}
									className={styles.SubmitButton}
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
							<RegistrationLogo />
							<div className={styles.SubmittedForm}>
								<div className={styles.ThankYouMessage}>
									Thank you for applying to VandyHacks!
									<br />
									You will hear back from us soon :&#41;
									<br />
									<br />
									If you do not receive any emails from us, please check your spam and&#47;or
									Microsoft 365 Quarantine.
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
							<RegistrationLogo />
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
							{/* Hacking Code */}
							{hackathonStarted && (
								<div style={{ padding: '20px' }}>
									<Header user={user} signOut={signOut} setting={setting as HackathonSettingsData} />

									<Leaderboard />

									<div className={styles['reportABugContainer']}>
										<Link href="/report">
											<div className={styles['reportABugText']}>Report a bug!</div>
										</Link>
										<BugOutlined />
									</div>
								</div>
							)}

							{/* Pre-hacking code */}
							{!hackathonStarted && (
								<>
									<RegistrationLogo />
									<div className={styles.SubmittedForm}>
										<div className={styles.ThankYouMessage}>
											Congratulations!
											<br />
											You have been accepted to VandyHacks!
											<div style={{ width: '100%', height: '16px' }}></div>
											<a href="https://discord.gg/WUMXjsZ6SF" target="_blank" rel="noreferrer">
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
								</>
							)}
						</>
					)}
					{user.applicationStatus === ApplicationStatus.REJECTED && (
						<>
							<RegistrationLogo />
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
							<RegistrationLogo />
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
