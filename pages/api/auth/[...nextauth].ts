import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import dbConnect from '../../../middleware/database';
import Hacker from '../../../models/hacker';

export default NextAuth({
	// Configure one or more authentication providers
	providers: [
		Providers.GitHub({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
			scope: 'read:user',
		}),
		Providers.Google({
			clientId: process.env.GOOGLE_ID,
			clientSecret: process.env.GOOGLE_SECRET,
		}),
		// ...add more providers here
	],
	session: {
		jwt: true,
	},
	callbacks: {
		async jwt(token, _account) {
			if (token) {
				if (!token.vakenUserData) {
					await dbConnect();
					token.vakenUserData = await Hacker.find({ email: token.email });;
				}
			}

			return token;
		},
		async session(session, token, _user) {
			session.vakenUserData = token.vakenUserData;
			console.log(session.vakenUserData);
			return session;
		}
	},
	// A database is optional, but required to persist accounts in a database
	database: process.env.DATABASE_URL,
});
