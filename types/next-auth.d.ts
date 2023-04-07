import NextAuth from 'next-auth';

declare module 'next-auth' {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
	 */
	interface Session {
		user: {
			/** The user's mongodb id. */
			_id: mongoose.Types.ObjectId;
			/** The user's email. */
			email: string;
			/** The user's image */
			image: string;
			/** The user's name. */
			name: string;
			/**The user's type */
			type: string;
		};
	}
}
