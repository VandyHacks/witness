import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '../../../lib/mongodb';
import dbConnect from '../../../middleware/database';
import vakenLogin from '../../../models/vakenLogin';
import User from '../../../models/user';
import testUser from '../../../models/testUser';

const DEV_DEPLOY =
	process.env.NODE_ENV === 'development' || ['preview', 'development'].includes(process.env?.VERCEL_ENV!);

export default async function auth(req: any, res: any) {
	await NextAuth(req, res, {
		providers: [
			GitHubProvider({
				clientId: process.env.GITHUB_ID as string,
				clientSecret: process.env.GITHUB_SECRET as string,
			}),
			GoogleProvider({
				clientId: process.env.GOOGLE_ID as string,
				clientSecret: process.env.GOOGLE_SECRET as string,
			}),
			// add username / pass login for dev builds for easier testing
			...(DEV_DEPLOY
				? [
						CredentialsProvider({
							// The name to display on the sign in form (e.g. "Sign in with...")
							name: 'Dev Credentials',
							// credentials is used to generate a suitable form on the sign in page.
							credentials: {
								username: { label: 'Username', type: 'text', placeholder: 'test' },
								password: { label: 'Password', type: 'password' },
							},
							async authorize(credentials, req) {
								await dbConnect();
								const user = await testUser.findOne({
									username: credentials?.username,
									password: credentials?.password,
								});

								if (user) {
									// Any object returned will be saved in `user` property of the JWT
									return user;
								} else {
									// If you return null then an error will be displayed advising the user to check their details.
									return null;
								}
							},
						}),
				  ]
				: []),
		],
		secret: process.env.SESSION_SECRET as string,
		session: {
			strategy: 'jwt',
		},
		callbacks: {
			async jwt({ token, user }) {
				await dbConnect();
				if (user) {
					const { email } = user;
					// user is only defined on first sign in
					const login = DEV_DEPLOY ? await testUser.findOne({ email }) : await User.findOne({ email });

					// read usertype from vaken db
					if (!login.userType) {
						const vakenUser = await vakenLogin.findOne({ email }).lean();
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

		theme: {
			colorScheme: 'dark',
			logo: '/vhlogo-white.svg',
		},
	});
}
