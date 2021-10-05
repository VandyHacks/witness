import NextAuth from 'next-auth';
// import Providers from 'next-auth/providers';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { TypeORMLegacyAdapter } from "@next-auth/typeorm-legacy-adapter"

import dbConnect from '../../../middleware/database';
import Hacker from '../../../models/hacker';

export default NextAuth({
	// Configure one or more authentication providers
	providers: [
		GitHubProvider({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
			// scope: 'read:user',
		}),
		GoogleProvider({
			clientId: process.env.GOOGLE_ID as string,
			clientSecret: process.env.GOOGLE_SECRET as string,
		}),
		// ...add more providers here
	],
	session: {
		jwt: true,
	},
	// felix@yahoo.com
	callbacks: {
		async jwt({token, user}) {
			await dbConnect();
			if (user) {
				// user is only defined on first sign in
				const hacker = await Hacker.findOne({ email: user.email });
				token.hacker = hacker;
				token.userType = "HACKER";
				console.log('User:', user);
			}
			console.log("Token: ", token);
			return token;
		},
		async session({session, token}) {
			if (!session.hacker) {
				session.hacker = token.hacker;
				session.userType = token.userType;
			}
			console.log('Sesh:', session);
			return session;
		},
	},

	// A database is optional, but required to persist accounts in a database
	adapter: TypeORMLegacyAdapter(process.env.DATABASE_URL as string),

	theme: {
		colorScheme: "auto",
		brandColor: "#314a81",
		logo: "/vhlogo-white.svg",
	}
});
