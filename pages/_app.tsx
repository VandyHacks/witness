import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<link rel="icon" type="image/x-icon" href="favicon.ico" />
				<title>{pageProps.title}</title>
			</Head>
			<SessionProvider session={pageProps.session}>
				<Component {...pageProps} />
			</SessionProvider>
		</>
	);
}
export default MyApp;
