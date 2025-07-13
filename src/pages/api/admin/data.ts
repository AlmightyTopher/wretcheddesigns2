import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const session = await getSession({ req });

    if (!session || session.user?.role !== 'admin') {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    res.status(200).json({ message: 'Admin data accessed successfully' });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}