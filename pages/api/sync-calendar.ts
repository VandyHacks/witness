import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import { parseICS, VEvent } from 'node-ical';
import Event from '../../models/event';

const calendarID = process.env.CALENDAR_ID;

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
	const session = await getSession({ req });
	if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

	await dbConnect();
	switch (req.method) {
		case 'GET':
            if (!calendarID) return res.send(451);
            const ics = await fetch(`https://www.google.com/calendar/ical/${calendarID}/public/basic.ics`).then(data => data.text());
			const calendarEvents = parseICS(ics);
            let promises = [];
            for (let ev of Object.keys(calendarEvents)) {
                if (calendarEvents[ev].type !== "VEVENT") continue;
                const event = calendarEvents[ev] as VEvent;
                const data = {
                    name: event.summary,
                    description: event.description,
                    startTime: event.start,
                    endTime: event.end,
                    gcid: event.uid,
                    location: event.location
                };
                promises.push(Event.findOneAndUpdate({ gcid: data.gcid }, data, { upsert: true }));
            }
            
            await Promise.all(promises);
            return res.send(200);
		default:
			return res.status(405).send('Method not supported brother');
	}
}