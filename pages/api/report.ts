import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Report from '../../models/Report';
import { Octokit } from 'octokit';
import hackathon from '../../models/hackathon';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });

	await dbConnect();
	switch (req.method) {
		case 'GET':
			const reports = await Report.find({});
			return res.status(200).send(reports);

		case 'POST':
			const { email, name, role, description, date, status } = req.body;

			// Use the GitHub API to create an issue
			const octokit = new Octokit({
				auth: process.env.GITHUB_TOKEN,
			});

			// make a more in depth description
			// tell the developer this is a bug report, provide the email, name, role, time, and description.
			// tell them that can track this issue in the organizer dashboard

			const fullDescription = `# Bug Report 
This is a bug report. You can track this issue in the organizer dashboard.
### Reporter Information 
Role: ${role === 'ORGANIZER' ? 'Organizer' : role === 'JUDGE' ? 'Judge' : 'Hacker'}
Issue was reported on ${
				new Date().toLocaleString('en-US', {
					timeZone: 'America/Chicago',
				}) + ' CT'
			}	
### Description 
${description}`;

			const SETTINGS = await hackathon.findOne({});

			// Make a request to the GitHub API to create an issue
			const response = await octokit.request('POST /repos/VandyHacks/witness/issues', {
				owner: 'VandyHacks',
				repo: 'witness',
				headers: {
					'X-GitHub-Api-Version': '2022-11-28',
				},
				title: `[BUG REPORT] Bug found by ${
					role === 'ORGANIZER' ? 'an organizer' : role === 'JUDGE' ? 'a judge' : 'a hacker'
				} on ${
					new Date()
						.toLocaleString('en-US', {
							timeZone: 'America/Chicago',
						})
						.split(',')[0]
				} at
					${
						new Date()
							.toLocaleString('en-US', {
								timeZone: 'America/Chicago',
							})
							.split(',')[1]
							.split(':')[0] +
						':' +
						new Date()
							.toLocaleString('en-US', {
								timeZone: 'America/Chicago',
							})
							.split(',')[1]
							.split(':')[1]
					} ${
					new Date()
						.toLocaleString('en-US', {
							timeZone: 'America/Chicago',
						})
						.split(' ')[2]
						.split(' ')[0]
				}`,
				body: fullDescription,
				assignees: [SETTINGS.ON_CALL_DEV as string],
			});

			// Create a new report in the database
			const report = await Report.create({
				email,
				name,
				role,
				description,
				date,
				status,
				ghIssueNumber: response.data.number,
				ghAssignee: SETTINGS.ON_CALL_DEV as string,
				ghUrl: response.data.html_url,
			});
			return res.status(200).send(report);

		case 'PATCH':
			const { id } = req.body;

			if (!id) {
				return res.status(400).send('No report ID provided');
			}

			const { status: newStatus } = req.body;

			if (!newStatus) {
				return res.status(400).send('No new status provided');
			}

			const updatedReport = await Report.findByIdAndUpdate(id, { status: { $eq: newStatus } }, { new: true });
			return res.status(200).send(updatedReport);

		case 'DELETE':
			const { id: reportId } = req.body;

			if (!reportId) {
				return res.status(400).send('No report ID provided');
			}

			const deletedReport = await Report.findByIdAndDelete({ $eq: reportId });

			// Use the GitHub API to delete an issue
			const octokit2 = new Octokit({
				auth: process.env.GITHUB_TOKEN,
			});

			return res.status(200).send(deletedReport);

		default:
			return res.status(405).send('Method not supported brother');
	}
}
