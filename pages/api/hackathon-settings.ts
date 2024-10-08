import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import hackathon from '../../models/hackathon';
import JudgingSession from '../../models/JudgingSession';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });

	await dbConnect();
	switch (req.method) {
		case 'GET':
			try {
				const hackathonSettings = await hackathon.findOne({});
				// if no hackathon settings, return 404
				if (!hackathonSettings) return res.status(404).send('Hackathon settings not found');
				return res.status(200).json(hackathonSettings);
			} catch (err) {
				return res.status(500).send("Couldn't get hackathon settings");
			}
		case 'PATCH':
			try {
				if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');
				// extract variables from body
				const {
					HACKATHON_START,
					HACKATHON_END,
					JUDGING_START,
					JUDGING_END,
					JUDGING_DURATION,
					JUDGING_TIME_PER_TEAM,
					ON_CALL_DEV,
				} = req.body;

				// check if hackathon settings valid (must be correct format of date)
				const isValid =
					isSettingsValid(HACKATHON_START) &&
					isSettingsValid(HACKATHON_END) &&
					isSettingsValid(JUDGING_START) &&
					isSettingsValid(JUDGING_END);

				// if not valid, return 400
				if (!isValid) return res.status(400).send('Invalid hackathon settings');

				// find the hackathon settings
				const updatedHackathonSettings = await hackathon.findOneAndUpdate(
					{},
					{
						$set: {
							HACKATHON_START,
							HACKATHON_END,
							JUDGING_START,
							JUDGING_END,
							JUDGING_DURATION,
							JUDGING_TIME_PER_TEAM: parseInt(JUDGING_TIME_PER_TEAM, 10),
							ON_CALL_DEV,
						},
					},
					{
						new: true,
					}
				);

				await JudgingSession.remove();
				// return the updated hackathon settings
				return res.status(200).json(updatedHackathonSettings);
			} catch (err) {
				return res.status(500).send("Couldn't get hackathon settings");
			}
		default:
			return res.status(405).send('Method not supported brother');
	}
}

const isSettingsValid = (date: string) => {
	return new Date(date).toString() !== 'Invalid Date';
};
