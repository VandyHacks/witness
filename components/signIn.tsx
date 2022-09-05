import { signIn } from 'next-auth/react';
import { GoogleOutlined, GithubOutlined, MailOutlined } from '@ant-design/icons';
import { Button, Space, Card, Image, Typography, Form, Input } from 'antd';

const { Item } = Form;
const { Title } = Typography;

const DEV_DEPLOY =
	process.env.NODE_ENV === 'development' || ['preview', 'development'].includes(process.env?.NEXT_PUBLIC_VERCEL_ENV!); // frontend env variable

export default function SignIn() {
	return (
		<div
			style={{
				backgroundImage: 'url(/background.png)',
				alignItems: 'center',
				height: '100vh',
				width: '100vw',
				backgroundSize: 'cover',
				display: 'flex',
				justifyContent: 'center',
			}}>
			<Card
				bordered={false}
				style={{
					width: 400,
					height: DEV_DEPLOY ? 650 : 450,
					display: 'flex',
					borderRadius: '8px',
					padding: '1.5rem',
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: '#003f3356',
				}}>
				{/* <button onClick={() => signIn()}>Sign in</button> */}
				<Space
					direction="vertical"
					style={{
						// justifyContent: 'center',
						alignItems: 'center',
					}}>
					<Image width="150px" src="/vhlogo-white.svg" alt="VandyHacks Logo" preview={false} />
					<br />
					<Title style={{ color: 'white' }}>VandyHacks IX</Title>
					<Button
						size="large"
						type="primary"
						icon={<GoogleOutlined />}
						style={{ borderRadius: '4px' }}
						onClick={() => signIn('google')}>
						Sign in with Google
					</Button>
					<Button
						size="large"
						type="primary"
						icon={<GithubOutlined />}
						style={{ borderRadius: '4px' }}
						onClick={() => signIn('github')}>
						Sign in with GitHub
					</Button>
					{DEV_DEPLOY && ( // email sign in only in dev
						<Form
							name="basic"
							// labelCol={{ span: 8 }}
							// wrapperCol={{ span: 16 }}
							layout="vertical"
							onFinish={values => signIn('credentials', { ...values })}
							//   onFinishFailed={onFinishFailed}
							autoComplete="off">
							<Item
								label={<label style={{ color: 'white' }}>Email</label>}
								name="email"
								rules={[{ required: true, message: 'Please input your email!' }]}>
								<Input />
							</Item>

							<Item
								label={<label style={{ color: 'white' }}>Password</label>}
								name="password"
								rules={[{ required: true, message: 'Please input your password!' }]}>
								<Input.Password />
							</Item>

							<Button
								size="large"
								type="primary"
								icon={<MailOutlined />}
								style={{ borderRadius: '4px' }}
								htmlType="submit">
								Sign in with Email
							</Button>
						</Form>
					)}
				</Space>
			</Card>
		</div>
	);
}
