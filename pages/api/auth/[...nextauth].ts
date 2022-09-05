import NextAuth from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '../../../lib/mongodb';
import dbConnect from '../../../middleware/database';
import User from '../../../models/user';
import PreAdd from '../../../models/preadd';
import log from '../../../middleware/log';

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
								email: { label: 'Email', type: 'text', placeholder: 'test@vandyhacks.dev' },
								password: { label: 'Password', type: 'password' },
							},
							async authorize(credentials, req) {
								if (!credentials) return null;
								const { email, password } = credentials;
								if (password !== process.env.TEST_PASSWD) return null;

								await dbConnect();
								const user = await User.findOne({
									email,
								});

								if (!user?.test) return null; // only allow test users
								return user;
							},
						}),
				  ]
				: []),
		],
		// pages: {
		//   signIn: "/signin",
		// },
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
					const login = await User.findOne({ email });
					if (!login.userType) {
						const preadded = await PreAdd.findOne({ email });
						if (preadded) {
							login.userType = preadded.userType;
							await login.save(); // ensure role has persisted before future action
							await log(login.id, `Found in preadd list, assigned role ${login.userType}`);
							// mark preadd entry as joined
							preadded.status = 'JOINED';
							await preadded.save();
						} else {
							login.userType = 'HACKER';
							await login.save();
						}
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
		adapter: MongoDBAdapter(clientPromise),

		theme: {
			colorScheme: 'dark',
			logo: '/vhlogo-white.svg',
		},
	});
}
