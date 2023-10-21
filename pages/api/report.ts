import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Report from '../../models/Report';
import { Octokit } from 'octokit';
import hackathon from '../../models/hackathon';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (!session || !session.user || !session.user.email) {
		return res.status(403).send('Unauthorized');
	}

	await dbConnect();
	switch (req.method) {
		case 'GET':
			const reports = await Report.find({});
			return res.status(200).send(reports);

		case 'POST':
			const { email, name, role, description, date } = req.body;

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
Issue was reported on ${getDateString()} at ${getTimeString()}	
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
				title: `[BUG REPORT] Bug found by ${getRoleString(role)} on ${getDateString()} at
					${getTimeString()}`,
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
				ghIssueNumber: response.data.number,
				ghAssignee: SETTINGS.ON_CALL_DEV as string,
				ghUrl: response.data.html_url,
			});
			return res.status(200).send(report);

		case 'DELETE':
			if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

			const { id: reportId } = req.body;

			if (!reportId) {
				return res.status(400).send('No report ID provided');
			}

			const deletedReport = await Report.findOneAndRemove({ _id: { $eq: reportId } });

			return res.status(200).send(deletedReport);

		default:
			return res.status(405).send('Method not supported brother');
	}
}

export const getRoleString = (role: string) => {
	switch (role) {
		case 'ORGANIZER':
			return 'Organizer';
		case 'JUDGE':
			return 'Judge';
		case 'HACKER':
			return 'Hacker';
		default:
			return 'Unknown';
	}
};

export const getDateString = () => {
	const dateObj = new Date();
	return `${
		dateObj
			.toLocaleString('en-US', {
				timeZone: 'America/Chicago',
			})
			.split(',')[0]
	}`;
};

export const getTimeString = () => {
	const dateObj = new Date();
	return `${
		dateObj
			.toLocaleString('en-US', {
				timeZone: 'America/Chicago',
			})
			.split(',')[1]
			.split(':')[0]
	}:${
		dateObj
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
	} CT`;
};
