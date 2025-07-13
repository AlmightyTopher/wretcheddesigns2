import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase'; // Adjust if needed
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { z } from 'zod';

// Schema Definitions
const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  image: z.string().url(),
});

const createProductSchema = z.object({
  category: z.string(),
  product: productSchema,
});

const updateProductSchema = z.object({
  category: z.string().optional(),
  product: productSchema.extend({ id: z.string().uuid() }),
});

// DELETE schema inline for simplicity
const deleteSchema = z.object({
  id: z.string().uuid("Invalid product ID format for deletion"),
  category: z.string().optional(),
});

const productsCollection = collection(db, 'products');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const id = searchParams.get('id');

  try {
    if (id) {
      const productDocRef = doc(db, 'products', id);
      const productDocSnap = await getDoc(productDocRef);
      if (productDocSnap.exists()) {
        return NextResponse.json({ id: productDocSnap.id, ...productDocSnap.data() });
      } else {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
    } else if (category) {
      const categoryQuery = query(productsCollection, where('category', '==', category));
      const categorySnapshot = await getDocs(categoryQuery);
      const productsList = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return NextResponse.json(productsList);
    } else {
      const productSnapshot = await getDocs(productsCollection);
      const productsList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return NextResponse.json(productsList);
    }
  } catch (error) {
    console.error("Error fetching products from Firestore:", error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = createProductSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ errors: validationResult.error.flatten() }, { status: 400 });
    }

    const { category, product } = validationResult.data;

    const docRef = await addDoc(collection(db, 'products'), {
      ...product,
      category,
    });

    return NextResponse.json({ success: true, product: { id: docRef.id, ...product } });
  } catch (error) {
    console.error("Error adding product to Firestore:", error);
    return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = updateProductSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ errors: validationResult.error.flatten() }, { status: 400 });
    }

    const { product } = validationResult.data;
    const productRef = doc(db, 'products', product.id);
    await updateDoc(productRef, {
      ...product,
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error updating product in Firestore:", error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = deleteSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ errors: validationResult.error.flatten() }, { status: 400 });
    }

    const { id } = validationResult.data;
    await deleteDoc(doc(db, 'products', id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product from Firestore:", error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
