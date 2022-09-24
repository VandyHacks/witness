import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import { IncomingForm } from 'formidable';
import { S3 } from '@aws-sdk/client-s3';
import fs from 'fs';

const s3 = new S3({
	region: 'us-east-2',
	credentials: {
		accessKeyId: process.env.VH_AWS_ACCESS_KEY_ID!,
		secretAccessKey: process.env.VH_AWS_SECRET_ACCESS_KEY!,
	},
	bucketEndpoint: true,
});

export const config = {
	api: {
		bodyParser: false,
	},
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	if (req.method !== 'GET') {
		return res.status(405).send('Method not supported brother');
	}

	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');
	const { id } = req.query;
	if (!id) return res.status(400).send('A user needs to be selected.');

	const resume = await s3.getObject({
		Bucket: `${process.env.VH_S3_BUCKET!}.s3.us-east-2.amazonaws.com`,
		Key: `resumes/${id}.pdf`,
	});

	return res.status(200).send(resume.Body);
}
