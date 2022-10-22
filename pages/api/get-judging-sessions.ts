import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	if (req.method !== 'GET') {
		return res.status(405).send('Method not supported brother');
	}

	const session = await getSession({ req });
	const userType = session?.userType;
	switch (userType) {
		case 'HACKER':
			break;
		case 'ORGANIZER':
			break;
		case 'JUDGE':
			break;
	}
}
