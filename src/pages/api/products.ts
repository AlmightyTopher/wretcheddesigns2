import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';

// Product type
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  available: boolean;
}

type ProductsData = Record<string, Product[]>;

const dataPath = path.join(process.cwd(), 'data/products.json');

function readData(): ProductsData {
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}
function writeData(data: ProductsData) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req;
  const category = query.category as string | undefined;
  const data = readData();

  if (method === 'GET') {
    if (category && data[category]) {
      res.status(200).json(data[category]);
    } else {
      res.status(200).json(data);
    }
  } else if (method === 'POST') {
    // Protect: require admin session
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Add new product to category
    if (!category || !data[category]) return res.status(400).json({ error: 'Invalid category' });
    data[category].push(body as Product);
    writeData(data);
    res.status(201).json(body);
  } else if (method === 'PUT') {
    // Protect: require admin session
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Update product in category
    if (!category || !data[category]) return res.status(400).json({ error: 'Invalid category' });
    const idx = data[category].findIndex((p: Product) => p.id === body.id);
    if (idx === -1) return res.status(404).json({ error: 'Product not found' });
    data[category][idx] = body as Product;
    writeData(data);
    res.status(200).json(body);
  } else if (method === 'DELETE') {
    // Protect: require admin session
    const session = await getServerSession(authOptions);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!session || (session.user as any).role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Remove product from category
    if (!category || !data[category]) return res.status(400).json({ error: 'Invalid category' });
    data[category] = data[category].filter((p: Product) => p.id !== body.id);
    writeData(data);
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
} 