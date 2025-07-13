import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

interface Category {
  id: string;
  name: string;
}

type CategoriesData = Category[];

const dataPath = path.join(process.cwd(), 'data/categories.json');

function readData(): CategoriesData {
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}
function writeData(data: CategoriesData) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body } = req;
  const data = readData();

  if (method === 'GET') {
    res.status(200).json(data);
  } else if (method === 'POST') {
    // Protect: require admin session
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Add new category
    data.push(body as Category);
    writeData(data);
    res.status(201).json(body);
  } else if (method === 'PUT') {
    // Protect: require admin session
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Update category
    const idx = data.findIndex((c: Category) => c.id === body.id);
    if (idx === -1) return res.status(404).json({ error: 'Category not found' });
    data[idx] = body as Category;
    writeData(data);
    res.status(200).json(body);
  } else if (method === 'DELETE') {
    // Protect: require admin session
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Remove category
    const filtered = data.filter((c: Category) => c.id !== body.id);
    writeData(filtered);
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
} 