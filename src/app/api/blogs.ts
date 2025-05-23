import type { NextApiRequest, NextApiResponse } from 'next';
    import { getFirebaseFirestore } from '@/lib/firebase'; // Assuming your firebase.ts is at this path
    import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

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
      // Add an 'id' field to match Firestore document ID
      id?: string;
    };


    export default async function handler(req: NextApiRequest, res: NextApiResponse) {
      const { method, body, query } = req;

      try {
        // Get Firestore instance only when needed
        const db = await getFirebaseFirestore();

        if (method === 'GET') {
          // Fetch all blogs
          const blogsCol = collection(db, 'blogs');
          const blogSnapshot = await getDocs(blogsCol);
          const blogsList = blogSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Blog));
          res.status(200).json(blogsList);

        } else if (method === 'POST') {
          // Create new blog
          const newBlogData: Omit<Blog, 'id'> = body; // Assuming body doesn't include id
          const docRef = await addDoc(collection(db, 'blogs'), newBlogData);
          res.status(201).json({ id: docRef.id, ...newBlogData });

        } else if (method === 'PUT') {
          // Update blog by slug (assuming slug is stored as a field in Firestore documents)
          // You might want to update by ID if you stored the slug as the document ID during migration
          const targetSlug = body.slug as string;
          if (!targetSlug) {
             return res.status(400).json({ error: 'Slug is required for update' });
          }

          // Find the document with the matching slug
          const blogsCol = collection(db, 'blogs');
          const q = query(blogsCol, where('slug', '==', targetSlug));
          const snapshot = await getDocs(q);

          if (snapshot.empty) {
            return res.status(404).json({ error: 'Blog not found' });
          }

          // Assuming only one document matches the slug
          const docToUpdateRef = doc(db, 'blogs', snapshot.docs[0].id);
          const updateData: Partial<Blog> = body;
          await updateDoc(docToUpdateRef, updateData);

          res.status(200).json({ id: docToUpdateRef.id, ...updateData });


        } else if (method === 'DELETE') {
          // Delete blog by slug (assuming slug is stored as a field in Firestore documents)
          // You might want to delete by ID if you stored the slug as the document ID
           const targetSlug = query.slug as string;
           if (!targetSlug) {
              return res.status(400).json({ error: 'Slug is required for deletion' });
           }

           // Find the document with the matching slug
           const blogsCol = collection(db, 'blogs');
           const q = query(blogsCol, where('slug', '==', targetSlug));
           const snapshot = await getDocs(q);

           if (snapshot.empty) {
             return res.status(404).json({ error: 'Blog not found' });
           }

           // Assuming only one document matches the slug
           const docToDeleteRef = doc(db, 'blogs', snapshot.docs[0].id);
           await deleteDoc(docToDeleteRef);

           res.status(204).end();

        } else {
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          res.status(405).end(`Method ${method} Not Allowed`);
        }
      } catch (error) {
        console.error("Error handling blog request with Firestore:", error);
        res.status(500).json({ error: 'An error occurred' });
      }
    }
