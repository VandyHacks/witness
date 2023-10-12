import { Button, Form, Layout } from 'antd';
import styles from '../styles/Report.module.css';
import Head from 'next/head';
import { useSession } from 'next-auth/react';
import { BugOutlined, SendOutlined } from '@ant-design/icons';
import React from 'react';
import TextArea from 'antd/lib/input/TextArea';

const ReportBug = () => {
	const { data: session, status } = useSession();

	const handleSubmitBug = async (input: any) => {
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
	};

	return (
		<>
			<Head>
				<title>Report a bug!</title>
				<meta property="og:title" content="VandyHacks X - Report a bug" />
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
					height: '100vh',
					backgroundImage: 'url(background-1.png)',
					backgroundRepeat: 'no-repeat',
					backgroundPosition: `center`,
					backgroundAttachment: 'fixed',
					backgroundSize: 'cover',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}>
				<div className={styles.reportContainer}>
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
							<Button className={styles.reportButton} htmlType="submit">
								Submit Bug! <SendOutlined />
							</Button>
						</div>
					</Form>
				</div>
			</Layout>
		</>
	);
};

export default ReportBug;
