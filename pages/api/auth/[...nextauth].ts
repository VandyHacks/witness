import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import dbConnect from '../../../middleware/database';
import vakenLogin from '../../../models/vakenLogin';
import User from '../../../models/user';

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
				const login = await User.findOne({email: user.email});

				// read usertype from vaken db
				if (!login.userType) {
					const vakenUser = await vakenLogin.findOne({ email: user.email });
					login.userType = vakenUser.userType;
					await login.save();
				}

				token.userType = login.userType;
				console.log('User:', user);
			}
			console.log("Token: ", token);
			return token;
		},
		async session(session, token) {
			if (!session.userType) {
				session.userType = token.userType;
			}
			console.log('Sesh:', session);
			return session;
		},
	},

	// A database is optional, but required to persist accounts in a database
	database: process.env.DATABASE_URL,
});
