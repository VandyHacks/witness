import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Report from '../../models/Report';
import { Octokit } from 'octokit';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });

	await dbConnect();
	switch (req.method) {
		case 'GET':
			const reports = await Report.find({});
			return res.status(200).send(reports);

		case 'POST':
			const { email, name, role, description, date, status } = req.body;

			console.log(process.env.GITHUB_TOKEN);

			const octokit = new Octokit({
				auth: process.env.GITHUB_TOKEN,
			});

			const response = await octokit.request('POST /repos/VandyHacks/witness/issues', {
				owner: 'VandyHacks',
				repo: 'witness',
				headers: {
					'X-GitHub-Api-Version': '2022-11-28',
				},
				title: 'Found a bug',
				body: "I'm having a problem with this.",
				assignees: ['jacoblurie29'],
			});

			console.log(response);

			const report = await Report.create({
				email,
				name,
				role,
				description,
				date,
				status,
			});
			return res.status(200).send(report);

		case 'PATCH':
			const { id } = req.query;
			const { status: newStatus } = req.body;
			const updatedReport = await Report.findByIdAndUpdate(id, { status: newStatus }, { new: true });
			return res.status(200).send(updatedReport);

		case 'DELETE':
			const { id: reportId } = req.query;
			const deletedReport = await Report.findByIdAndDelete(reportId);
			return res.status(200).send(deletedReport);

		default:
			return res.status(405).send('Method not supported brother');
	}
}
