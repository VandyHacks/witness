import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import Application from '../../models/application';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    const session = await getSession({req});
    


    await dbConnect();

    switch (req.method) {
        case 'GET':
            const count = await Application.aggregate([
				{ 
                    $unwind: "$dietaryRestrictions" 
                },
                { 
                    $group: { 
                        _id: "$dietaryRestrictions", 
                        count: { $sum: 1 } 
                    } 
                },
                { 
                    $sort: { count: -1 } 
                }
			]);
            return res.status(200).send(JSON.stringify(count));
        default:
            return res.status(405).send('Method not supported brother');
    }

}