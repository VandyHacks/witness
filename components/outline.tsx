import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Outline.module.css';
import React, { FunctionComponent } from 'react';
import { Layout, Menu, Breadcrumb, Space } from 'antd';
const { Header, Content, Footer } = Layout;
import Link from 'next/link';

export default function Outline({ children, home }: { children: React.ReactNode; home?: boolean }) {
	return (
		<Layout className={styles.layout}>
			<Header>
				<div className={styles.logo}>
					<Image src="/vhlogo-white.svg" alt="VH Logo" width={36} height={36} />
				</div>
				<Menu className={styles.menu} theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
					<Menu.Item key="dashboard"><Link href="/dashboard">Dashboard</Link></Menu.Item>
					<Menu.Item key="form"><Link href="/forms">Form</Link></Menu.Item>
					<Menu.Item key="uwu"><Link href="/uwu">uwu</Link></Menu.Item>
					<Menu.Item key="owo"><Link href="/owo">owo</Link></Menu.Item>
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
