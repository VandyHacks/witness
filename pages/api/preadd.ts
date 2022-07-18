import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../middleware/database';
import { getSession } from 'next-auth/react';
import PreAdd from '../../models/preadd';
import { PreAddFormFields } from '../../components/preAddForm';
import { MongoBulkWriteError, WriteError } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const session = await getSession({ req });
  if (session?.userType !== 'ORGANIZER') return res.status(403).send('Forbidden');

  await dbConnect();

  switch (req.method) {
    case 'GET':
      return res.send(await PreAdd.find());
    case 'DELETE':
      const { userId } = req.body;
      console.log(`removing user with id ${userId} from preadded`);
      const deleted = await PreAdd.findByIdAndDelete(userId);
      return res.status(200).send(`Deleted ${deleted.name} from preadded successfully.`);
    case 'POST': {
      const { formData } = req.body;
      console.log('preadded formdata: ', formData);
      if (formData.users === undefined) return res.status(400).send(`No user data provided.`);
      try {
        const preadded = await PreAdd.insertMany(
          // add submitter to every field
          formData!.users.map((data: PreAddFormFields) => ({ ...data, addedBy: session!.user!.name })),
          { ordered: false } // so duplicates don't make it fail early
        );
        return res.send(`Stored preadd info for ${preadded.length} user(s).`);
      } catch (e) {
        if (e instanceof MongoBulkWriteError && e.code == 11000) {
          // handle duplicates
          console.log(e);
          let msg = `Inserted ${e.result.nInserted} user(s) but encountered duplicates: `;
          // collect all non inserted rows
          (e.writeErrors as Array<WriteError>).forEach(
            (e: WriteError) => (msg += e.errmsg!.slice(70) + ', ')
          ); // remove extra parts
          console.log(msg);
          return res.status(422).send(msg);
        } else throw e;
      }
    }
    default:
      return res.status(405).send('Method not supported brother');
  }
}
