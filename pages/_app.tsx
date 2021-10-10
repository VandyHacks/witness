import '../styles/globals.css';
import { Provider } from 'next-auth/client';
import type { AppProps } from 'next/app';
import Head from 'next/head';

function MyApp({ Component, pageProps }: AppProps) {
	return (
		<>
		<Head>
			<link rel="icon" type="image/x-icon" href="favicon.ico" />
		</Head>
		<Provider session={pageProps.session}>
			<Component {...pageProps} />
		</Provider>
		</>
	);
}
export default MyApp;
