import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseFirestore } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { z } from 'zod';

// SCHEMA DEFINITIONS
const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const createCategorySchema = categorySchema.omit({ id: true }).extend({
  id: z.string().uuid().optional(),
});

const updateCategorySchema = categorySchema.partial().extend({
  id: z.string().uuid(),
}).refine((data) => Object.keys(data).length > 1, {
  message: 'At least one field (name or description) must be provided for update.',
});

const deleteSchema = z.object({
  id: z.string().uuid(),
});


// GET: /api/categories or /api/categories?id=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const db = await getFirebaseFirestore();
  const col = collection(db, 'categories');
  const id = searchParams.get('id');

  try {
    if (id) {
      const ref = doc(db, 'categories', id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      return NextResponse.json({ id: snap.id, ...snap.data() });
    }

    const snap = await getDocs(col);
    const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
  }
}

// POST: Add a new category (expects {id?, name, description?})
export async function POST(req: NextRequest) {
  const db = await getFirebaseFirestore();
  const col = collection(db, 'categories');
  try {
    const body = await req.json();
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const newData = validation.data;
    const customId = newData.id;

    if (customId) {
      const ref = doc(db, 'categories', customId);
      await ref.set({ name: newData.name, description: newData.description ?? '' });
      return NextResponse.json({ success: true, category: { id: customId, ...newData } }, { status: 201 });
    }

    const ref = await addDoc(col, newData);
    return NextResponse.json({ success: true, category: { id: ref.id, ...newData } }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Error creating category' }, { status: 500 });
  }
}

// PUT: Update a category (expects {id, name?, description?})
export async function PUT(req: NextRequest) {
  const db = await getFirebaseFirestore();
  try {
    const body = await req.json();
    const validation = updateCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const { id, ...updates } = validation.data;
    const ref = doc(db, 'categories', id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await updateDoc(ref, updates);
    return NextResponse.json({ success: true, category: { id, ...snap.data(), ...updates } });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Error updating category' }, { status: 500 });
  }
}

// DELETE: Remove a category (expects {id})
export async function DELETE(req: NextRequest) {
  const db = await getFirebaseFirestore();
  try {
    const body = await req.json();
    const validation = deleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const { id } = validation.data;
    const ref = doc(db, 'categories', id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await deleteDoc(ref);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Error deleting category' }, { status: 500 });
  }
}
