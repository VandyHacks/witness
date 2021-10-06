import Image from 'next/image';
import styles from '../styles/Outline.module.css';
import React from 'react';
import { Button, Layout, Menu, Space } from 'antd';
const { Header, Content, Footer } = Layout;
import Link from 'next/link';
import { signOut } from 'next-auth/client';

interface OutlineProps {
	children: React.ReactNode;
	home?: boolean;
	userType: 'HACKER' | 'JUDGE' | 'ORGANIZER';
}

export default function Outline({ children, home, userType }: OutlineProps) {
	// let menuItems = [];
	// switch (userType) {
	// 	case 'JUDGE':
	// 		menuItems = [];
	// }

	return (
		<Layout className={styles.layout}>
			<Header>
				<div className={styles.logo}>
					<Image src="/vhlogo-white.svg" alt="VH Logo" width={36} height={36} />
				</div>
				<Menu className={styles.menu} theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
					<Menu.Item key="dashboard">
						<Link href="/dashboard">Dashboard</Link>
					</Menu.Item>
					<Menu.Item key="forms">
						<Link href="/forms">Forms</Link>
					</Menu.Item>
					<Menu.Item key="logout">
						<div onClick={() => signOut({ callbackUrl: '/' })}>Logout</div>
					</Menu.Item>
				</Menu>
			</Header>
			<Content style={{ padding: '0 50px' }}>
				<Space direction="vertical" className={styles.siteLayoutContent}>
					{children}
				</Space>
			</Content>
			<Footer className={styles.footer}>
				<a
					href="https://vercel.com?utm_source=vandyhacks-witness&utm_campaign=oss"
					target="_blank"
					rel="noopener noreferrer">
					Powered by{' '}
					<span className={styles.ossBanner}>
						<Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
					</span>
				</a>
			</Footer>
		</Layout>
	);
}
