import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export type Blog = {
  title: string;
  description: string;
  imageURL: string;
  content: string;
  slug: string;
  tags: string[];
  author: string;
  publishDate: string;
  comments?: { author: string; text: string; date: string }[];
};

const dataPath = path.join(process.cwd(), 'data/blogs.json');

function readData(): Blog[] {
  if (!fs.existsSync(dataPath)) return [];
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}
function writeData(data: Blog[]) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body, query } = req;
  let data = readData();

  if (method === 'GET') {
    res.status(200).json(data);
  } else if (method === 'POST') {
    // Create new blog
    data.push(body as Blog);
    writeData(data);
    res.status(201).json(body);
  } else if (method === 'PUT') {
    // Update blog by slug
    const idx = data.findIndex((b: Blog) => b.slug === body.slug);
    if (idx === -1) return res.status(404).json({ error: 'Blog not found' });
    data[idx] = body as Blog;
    writeData(data);
    res.status(200).json(body);
  } else if (method === 'DELETE') {
    // Delete blog by slug
    data = data.filter((b: Blog) => b.slug !== query.slug);
    writeData(data);
    res.status(204).end();
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
} 