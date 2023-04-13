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
import { JWT } from 'next-auth/jwt';

const DEV_DEPLOY =
	process.env.NODE_ENV === 'development' || ['preview', 'development'].includes(process.env?.VERCEL_ENV!);

export default async function auth(req: any, res: any) {
	await NextAuth(req, res, {
		session: {
			strategy: 'jwt',
		},

		providers: [
			// GitHubProvider docs: https://next-auth.js.org/providers/github
			GitHubProvider({
				clientId: process.env.GITHUB_ID as string,
				clientSecret: process.env.GITHUB_SECRET as string,
			}),

			// GoogleProvider docs: https://next-auth.js.org/providers/google
			GoogleProvider({
				clientId: process.env.GOOGLE_ID as string,
				clientSecret: process.env.GOOGLE_SECRET as string,
			}),

			// add username / pass login for dev builds for easier testing
			...(DEV_DEPLOY
				? [
						// Credentials docs: https://next-auth.js.org/providers/credentials
						CredentialsProvider({
							// The name to display on the sign in form (e.g. "Sign in with...")
							name: 'Dev Credentials',
							// credentials is used to generate a suitable form on the sign in page.
							credentials: {
								email: { label: 'Email', type: 'text', placeholder: 'test@vandyhacks.dev' },
								password: { label: 'Password', type: 'password' },
							},

							async authorize(credentials) {
								if (!credentials) return null;

								// get user email and password from credentials
								const { email, password } = credentials;

								// validate password by comparing with TEST_PASSWD
								if (password !== process.env.TEST_PASSWD) return null;

								await dbConnect();

								// validate whether user exists in database
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

		secret: process.env.SESSION_SECRET as string,

		// Callbacks doc: https://next-auth.js.org/configuration/callbacks
		callbacks: {
			/**
			 * @param token JWT token
			 * @param user Logged in user
			 * @returns JWT token with user's usertype
			 */
			async jwt({ token, user }) {
				await dbConnect();

				if (user) {
					console.log("User's data from the form: ", user);

					const { email } = user;
					// user is only defined on first sign in
					const login = await User.findOne({ email });
					console.log("User's data in database: ", login);

					// Determine if we need to assign a userType for the logged in user
					if (!login.userType) {
						// TODO: What is PreAdd?
						const preadded = await PreAdd.findOne({ email });
						console.log('Preadded user: ', preadded);

						if (preadded) {
							login.userType = preadded.userType;
							// ensure role has persisted before future action
							await login.save();
							await log(login.id, `Found in preadd list, assigned role ${login.userType}`);

							// mark preadd entry as joined
							preadded.status = 'JOINED';
							await preadded.save();
						} else {
							// If user is not preadded, assign its userType as HACKER
							login.userType = 'HACKER';
							await login.save();
						}
					}

					// Store the logged in user's userType in token
					token.userType = login.userType;
				}

				console.log('Token: ', token);

				return token;
			},

			/**
			 * Update session's user id and user type with token.sub
			 * and token.userType
			 * @param session
			 * @param token Contains user type
			 * @returns session with user id and user type inside
			 */
			async session({ session, token }: { session: any; token: any }) {
				// if (!session.user.type || !session.user._id) {
				// 	session.user.type = token.userType;

				// 	session.user._id = token.sub;
				// }

				if (session?.user) {
					session.user._id = token.sub;
					session.user.type = token.userType;
				}

				console.log('Session: ', session);
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
