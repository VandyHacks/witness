import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '../../../lib/mongodb';
import dbConnect from '../../../middleware/database';
import vakenLogin from '../../../models/vakenLogin';
import User from '../../../models/user';

export default async function auth(req: any, res: any) {
	await NextAuth(req, res, {
		providers: [
			GitHubProvider({
				clientId: process.env.GITHUB_ID || '',
				clientSecret: process.env.GITHUB_SECRET || '',
			}),
			GoogleProvider({
				clientId: process.env.GOOGLE_ID || '',
				clientSecret: process.env.GOOGLE_SECRET || '',
				authorization:
					'https://accounts.google.com/o/oauth2/v2/auth?prompt=consent&access_type=offline&response_type=code',
			}),
		],
		session: {
			jwt: true,
		},
		callbacks: {
			// async signIn({ user, account, profile }) {
			// 	if (account.provider == 'github') {
			// 		const res = await fetch('https://api.github.com/user/emails', {
			// 			headers: { Authorization: `token ${account.accessToken}` },
			// 		});
			// 		const emails = await res.json();
			// 		if (emails?.length > 0) {
			// 			user.email = emails.sort((a: any, b: any) => b.primary - a.primary)[0].email;
			// 		}
			// 	}

			// 	return true;
			// },
			async jwt({ token, user, account }) {
				await dbConnect();
				if (user) {
					// user is only defined on first sign in
					const login = await User.findOne({ email: user.email });

					// read usertype from vaken db
					if (!login.userType) {
						const vakenUser = await vakenLogin.findOne({ email: user.email }).lean();
						if (vakenUser?.userType) login.userType = vakenUser.userType;
						await login.save();
					}

					token.userType = login.userType;
				}
				return token;
			},
			async session({ session, token }) {
				if (!session.userType || !session.userID) {
					session.userType = token.userType;
					session.userID = token.sub;
				}
				return session;
			},
		},

		// A database is optional, but required to persist accounts in a database
		adapter: MongoDBAdapter({
			db: (await clientPromise).db('witness'),
		}),
	});
}
