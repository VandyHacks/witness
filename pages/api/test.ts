import dbConnect from "../../middleware/database";
import { Hacker } from "../../models/hacker";
import type { NextApiRequest, NextApiResponse } from 'next';

interface Data {
    success: string,
    data: JSON,
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    const { method } = req;
    await dbConnect();

    const hacker = await Hacker.find({firstName: "Samuel"});
    console.log(hacker);

	res.status(200).json({success: "true", data: hacker as unknown as JSON});
}