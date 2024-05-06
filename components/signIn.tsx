import { signIn } from 'next-auth/react';
import { GoogleOutlined, GithubOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Space, Image, Form, Input } from 'antd';
import styles from '../styles/Signin.module.css';

const { Item } = Form;

const DEV_DEPLOY =
	process.env.NODE_ENV === 'development' || ['preview', 'development'].includes(process.env.NEXT_PUBLIC_VERCEL_ENV!); // frontend env variable

export default function SignIn() {
	return (
		<div className={styles.SignIn}>
			<div className={styles.Card}>
				<div className={styles.Logo}>
					<Image src="/vh-logo.png" alt="VandyHacks Logo" preview={false} />
				</div>

				<br />

				<div className={styles.Title}>VandyHacks X</div>

				<div className={styles.SignInOptions}>
					<Space direction="vertical" size="small" align="center">
						{DEV_DEPLOY && ( // email sign in only in dev
							<>
								<Form
									name="basic"
									layout="vertical"
									onFinish={values => signIn('credentials', { ...values })}
									autoComplete="off"
									style={{ display: 'flex', flexDirection: 'column' }}>
									<Item
										name="email"
										rules={[{ required: true, message: 'Please input your email!' }]}>
										<Input placeholder="Email" />
									</Item>

									<Item
										name="password"
										rules={[{ required: true, message: 'Please input your password!' }]}>
										<Input.Password placeholder="Password" />
									</Item>

									<Button
										size="large"
										type="primary"
										icon={<MailOutlined />}
										className={styles.ButtonStyle}
										htmlType="submit"
										style={{ alignSelf: 'center' }}>
										Sign in with Email
									</Button>
								</Form>

								<div className={styles.Divider} />
							</>
						)}

						<Button
							size="large"
							type="primary"
							icon={<GoogleOutlined />}
							className={styles.ButtonStyle}
							onClick={() => signIn('google')}>
							Sign in with Google
						</Button>

						<Button
							size="large"
							type="primary"
							icon={<GithubOutlined />}
							className={styles.ButtonStyle}
							onClick={() => signIn('github')}>
							Sign in with GitHub
						</Button>
					</Space>
				</div>
			</div>
		</div>
	);
}
