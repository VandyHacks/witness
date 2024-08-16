import { Button, ConfigProvider, Form, Layout, Skeleton, Table, Tag, theme } from 'antd';
import styles from '../styles/Report.module.css';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { ArrowLeftOutlined, BugOutlined, CheckCircleFilled, CloseCircleFilled, SendOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import TextArea from 'antd/lib/input/TextArea';
import Link from 'next/link';
import { RequestType, useCustomSWR } from '../utils/request-utils';
import { GitHubIssueStatus, Report } from '../types/client';
import { ColumnsType } from 'antd/lib/table';
import { Octokit } from 'octokit';
import { useRouter } from 'next/router';
import { handleSubmitFailure, handleSubmitSuccess } from '../lib/helpers';
import { getTagColorFromRole, getTagTextFromRole } from '../utils/bugs-utils';

const ReportBug = () => {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [success, setSuccess] = useState<boolean | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [githubIssues, setGithubIssues] = useState<GitHubIssueStatus[] | null>(null);

	useEffect(() => {
		const fetchGithubIssue = async () => {
			const octokit = new Octokit({
				auth: process.env.GITHUB_TOKEN,
			});

			await octokit
				.request('GET /repos/VandyHacks/witness/issues?state=all', {
					owner: 'VandyHacks',
					repo: 'witness',
					headers: {
						'X-GitHub-Api-Version': '2022-11-28',
					},
				})
				.then(res => {
					// parse through issues and match the issue number and status
					console.log(res.data);
					const issues = res.data.map((issue: any) => {
						return {
							issueNumber: issue.number,
							status: issue.state,
						};
					});
					setGithubIssues(issues);
				})
				.catch(err => {
					console.error(err);
				});
		};

		fetchGithubIssue();
	}, []);

	const handleSubmitBug = async (input: any) => {
		setLoading(true);
		const newReport = {
			email: session?.user?.email,
			name: session?.user?.name,
			role: session?.userType || 'HACKER',
			date: new Date().toISOString(),
			description: input.description,
		};
		const res = await fetch('/api/report', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newReport),
		});

		if (res.status === 200) {
			setSuccess(true);
			handleSubmitSuccess('Successfully submitted bug.');
		} else {
			setSuccess(false);
			handleSubmitFailure('Failed to submit bug.');
		}
		setLoading(false);
	};

	const { data: bugReports, error: bugReportsError } = useCustomSWR<Report[]>({
		url: '/api/report',
		method: RequestType.GET,
		errorMessage: 'Failed to get bug reports.',
	});

	if (!session && status === 'unauthenticated') router.push('/');

	const newCols: ColumnsType<Report> = [
		{
			title: 'Description',
			dataIndex: 'description',
			key: 'description',
			width: '40%',
		},
		{
			title: 'Date',
			dataIndex: 'date',
			key: 'date',
			width: '20%',
			render: (date: string) => {
				return <div>{new Date(date).toLocaleString()}</div>;
			},
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			width: '20%',
			render: (_: string, record: Report) => {
				return (
					<Tag color={getTagColorFromRole(githubIssues, record)}>
						{getTagTextFromRole(githubIssues, record)}
					</Tag>
				);
			},
		},
		{
			title: 'GitHub',
			key: 'github',
			width: '20%',
			render: (text: string, record: Report) =>
				record.ghUrl && (
					<a
						href={record.ghUrl}
						target="_blank"
						rel="noreferrer"
						style={{ color: 'inherit', textDecoration: 'none' }}>
						<Button>View on GitHub</Button>
					</a>
				),
		},
	];

	const bugReportsForTable = // [] as Report[] | undefined;
		bugReports?.map(x => ({ ...x, key: x._id })).filter(record => record.email === session?.user?.email) ||
		([] as Report[]);

	return (
		<>
			<Head>
				<title>Report a bug!</title>
				<meta property="og:title" content="VandyHacks XI - Report a bug" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://apply.vandyhacks.org" />
				<meta property="og:image" content="/vh.png" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@vandyhacks" />
				<meta name="twitter:creator" content="@vandyhacks" />
				<meta name="author" content="VandyHacks" />
				<meta name="description" content="Report a bug for the VandyHacks application!👨🏻‍💻" />
				<meta property="og:description" content="Report a bug for the VandyHacks application!👨🏻‍💻" />
			</Head>
			<Layout
				style={{
					width: '100vw',
					backgroundImage: 'url(background-1.png)',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: `center`,
					backgroundAttachment: 'fixed',
					backgroundSize: 'cover',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					overflow: 'scroll',
					height: '100vh',
				}}>
				{!session ? null : (
					<div className={styles.reportOuterContainer}>
						<div className={styles.reportContainer}>
							{success === null ? (
								<>
									<h1 className={styles.reportTitle}>
										Report a bug! <BugOutlined />
									</h1>
									<div className={styles.reportSubtitleContainer}>
										<h3 className={styles.reportSubtitle}>Oh no! You&apos;ve found a bug.</h3>
										<h3 className={styles.reportSubtitle}>&nbsp;Help us squash it!</h3>
									</div>

									<Form
										layout={'vertical'}
										labelCol={{ span: 8 }}
										labelAlign="left"
										onFinish={handleSubmitBug}
										requiredMark={false}
										scrollToFirstError={true}>
										<Form.Item
											name="description"
											rules={[{ required: true, message: 'Please write a description!' }]}>
											<TextArea
												className={styles.reportTextArea}
												placeholder="Tell us about the bug you found..."
												rows={8}
											/>
										</Form.Item>
										<div className={styles.reportInfoAndSubmitContainer}>
											<p
												className={
													styles.reportUserInfo
												}>{`Reporting as ${session?.user?.name} (${session?.user?.email})`}</p>{' '}
											<Button
												className={styles.reportButton}
												htmlType={loading ? 'button' : 'submit'}>
												Submit Bug! <SendOutlined />
											</Button>
										</div>
									</Form>
								</>
							) : (
								<>
									<h1 className={styles.reportTitle}>
										{success ? (
											<>
												Success! <CheckCircleFilled />
											</>
										) : (
											<>
												Uh oh! <CloseCircleFilled />
											</>
										)}
									</h1>
									<div className={styles.completedScreeen}>
										<h3 className={styles.reportSubtitle}>
											{success
												? `Thanks for helping us squash this bug! We'll take a look and get back to you soon.`
												: `Something went wrong. Please email us at info@vandyhacks.org!`}
										</h3>
										<Button className={styles.reportButton}>
											<Link href="/">
												<a>
													<ArrowLeftOutlined />
													&nbsp;&nbsp;Return Home
												</a>
											</Link>
										</Button>
									</div>
								</>
							)}
							{bugReportsForTable && bugReportsForTable?.length > 0 && (
								<>
									<div>
										<h3 className={styles.yourBugsSubtitle}>Your Reported Bugs</h3>
										<ConfigProvider
											theme={{
												algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
												token: {
													colorPrimary: '#FFFFFF', // buttons, tab selected, on hover
													colorBgBase: '#140f2e', // backgrounds
												},
											}}>
											<div className={styles['table-container']}>
												<Table
													style={{
														paddingBottom: '20px',
													}}
													columns={newCols}
													dataSource={bugReportsForTable}
													pagination={false}
													loading={!githubIssues}
												/>
											</div>
										</ConfigProvider>
									</div>
									{success === null && (
										<Button className={styles.goHomeButton}>
											<Link href="/">
												<a>
													<ArrowLeftOutlined />
													&nbsp;&nbsp;Return Home
												</a>
											</Link>
										</Button>
									)}
								</>
							)}
						</div>
					</div>
				)}
			</Layout>
		</>
	);
};

export default ReportBug;
