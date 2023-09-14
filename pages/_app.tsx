import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '../theme/themeProvider';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
			<Head>
				<link rel="icon" type="image/x-icon" href="favicon.ico" />
				<title>{pageProps.title}</title>
			</Head>
			<SessionProvider session={pageProps.session}>
				<ThemeProvider>
					<Component {...pageProps} />
				</ThemeProvider>
			</SessionProvider>
		</>
	);
}
export default MyApp;
