import { signIn } from 'next-auth/react';
import { GoogleOutlined, GithubOutlined } from '@ant-design/icons';
import { Button, Space, Card, Image, Typography } from 'antd';

const { Title } = Typography;

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
			}}
		>
			<Card
				bordered={false}
				style={{
					width: 400,
					height: 450,
					display: 'flex',
					borderRadius: '8px',
					padding: '1.5rem',
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: '#003f3356',
				}}
			>
				{/* <button onClick={() => signIn()}>Sign in</button> */}
				<Space
					direction="vertical"
					style={{
						// justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<Image width="150px" src="/vhlogo-white.svg" alt="VandyHacks Logo" preview={false} />
					<br />
					<Title style={{ color: 'white' }}>VandyHacks IX</Title>
					<Button
						size="large"
						type="primary"
						icon={<GoogleOutlined />}
						style={{ borderRadius: '4px' }}
						onClick={() => signIn('google')}
					>
						Sign in with Google
					</Button>
					<Button
						size="large"
						type="primary"
						icon={<GithubOutlined />}
						style={{ borderRadius: '4px' }}
						onClick={() => signIn('github')}
					>
						Sign in with GitHub
					</Button>
				</Space>
			</Card>
		</div>
	);
}
