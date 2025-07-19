import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';

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
  id?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body, query: reqQuery } = req;

  try {
    if (method === 'GET') {
      const blogsCol = collection(db, 'blogs');
      const snapshot = await getDocs(blogsCol);
      const blogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
      return res.status(200).json(blogs);

    } else if (method === 'POST') {
      const newBlogData: Omit<Blog, 'id'> = body;
      const docRef = await addDoc(collection(db, 'blogs'), newBlogData);
      return res.status(201).json({ id: docRef.id, ...newBlogData });

    } else if (method === 'PUT') {
      const targetSlug = body.slug as string;
      if (!targetSlug) {
        return res.status(400).json({ error: 'Slug is required for update' });
      }

      const blogsCol = collection(db, 'blogs');
      const q = query(blogsCol, where('slug', '==', targetSlug));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      const docToUpdateRef = doc(db, 'blogs', snapshot.docs[0].id);
      const updateData: Partial<Blog> = body;
      await updateDoc(docToUpdateRef, updateData);

      return res.status(200).json({ id: docToUpdateRef.id, ...updateData });

    } else if (method === 'DELETE') {
      const targetSlug = reqQuery.slug as string;
      if (!targetSlug) {
        return res.status(400).json({ error: 'Slug is required for deletion' });
      }

      const blogsCol = collection(db, 'blogs');
      const q = query(blogsCol, where('slug', '==', targetSlug));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      const docToDeleteRef = doc(db, 'blogs', snapshot.docs[0].id);
      await deleteDoc(docToDeleteRef);

      return res.status(204).end();

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error handling blog request with Firestore:', error);
    return res.status(500).json({ error: 'An error occurred' });
  }
}
