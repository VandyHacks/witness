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
	if (req.method !== 'POST') {
		return res.status(405).send('Method not supported brother');
	}

	const session = await getSession({ req });
	if (!session || !session.user || !session.user.email) {
		return res.send(403);
	}

	await dbConnect();
	const data: any = await new Promise((res, rej) => {
		const form = new IncomingForm();

		form.parse(req, (err, _, files) => {
			if (err) return rej(err);
			res({ files });
		});
	});

	await s3.putObject({
		Bucket: `${process.env.VH_S3_BUCKET!}.s3.us-east-2.amazonaws.com`,
		Key: `resumes/${session.userID}.pdf`,
		Body: fs.readFileSync(data.files.resume.filepath),
	});

	return res.send(200);
}
