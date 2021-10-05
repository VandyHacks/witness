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
	// felix@yahoo.com
	callbacks: {
		async jwt(token, user) {
			await dbConnect();
			if (user) {
				// user is only defined on first sign in
				const hacker = await Hacker.findOne({ email: user.email });
				token.vaken = hacker;
				console.log('User:', user);
			}

			return token;
		},
		async session(session, token) {
			if (!session.vaken) session.vaken = token.vaken;
			console.log('session:', session);
			return session;
		},
	},

	// A database is optional, but required to persist accounts in a database
	database: process.env.DATABASE_URL,
});
