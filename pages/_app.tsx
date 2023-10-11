import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AccentColor, Theme, ThemeContext } from '../theme/themeProvider';
import { useState } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
	// Theme stuffs
	const [baseTheme, setBaseTheme] = useState<Theme>(Theme.DARK);
	const [accentColor, setAccentColor] = useState<AccentColor>(AccentColor.ORANGE);
	const themeValues = {
		baseTheme,
		setBaseTheme,
		accentColor,
		setAccentColor,
	};

	return (
		<>
			<Head>
				<link rel="icon" type="image/x-icon" href="favicon.ico" />
				<title>{pageProps.title}</title>
			</Head>
			<SessionProvider session={pageProps.session}>
				<ThemeContext.Provider value={themeValues}>
					<Component {...pageProps} />
				</ThemeContext.Provider>
			</SessionProvider>
		</>
	);
}
export default MyApp;
