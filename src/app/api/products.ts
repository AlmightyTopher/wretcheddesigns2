import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

const DATA_PATH = path.join(process.cwd(), 'data', 'products.json');

// Helper to read products.json
type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  available: boolean;
};

type ProductsData = Record<string, Product[]>; // category -> products

async function readProducts(): Promise<ProductsData> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      // If the file doesn't exist, return an empty object
      return {};
    }
    throw error;
  }
}

async function writeProducts(data: ProductsData) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

const productSchema = z.object({
  id: z.string().uuid("Invalid product ID format"),
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Price must be a positive number"),
  description: z.string().min(1, "Description is required"),
  image: z.string().url("Invalid image URL format"),
  available: z.boolean(),
});

const createProductSchema = z.object({
  category: z.string().min(1, "Category is required"),
  product: productSchema,
});

const updateProductSchema = z.object({
  category: z.string().min(1, "Category is required"),
  product: productSchema.partial().extend({
    id: z.string().uuid("Invalid product ID format"), // ID is required for update but not allowed to be changed
  }),
});


// GET: /api/products?category=... or /api/products?id=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const id = searchParams.get('id');
  const data = await readProducts();

  if (id) {
    for (const products of Object.values(data)) {
      const found = products.find((p) => p.id === id);
      if (found) return NextResponse.json(found);
    }
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }
  if (category) {
    if (!data[category]) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    return NextResponse.json(data[category]);
  }
  // Return all products
  return NextResponse.json(data);
}

// POST: Add a new product (expects {category, product})
export async function POST(req: NextRequest) {
  const body = await req.json();
  const validationResult = createProductSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json({ errors: validationResult.error.flatten() }, { status: 400 });
  }

  const { category, product } = validationResult.data;

  const data = await readProducts();
  if (!data[category]) data[category] = [];
  if (data[category].some((p) => p.id === product.id)) {
    return NextResponse.json({ error: 'Product with this ID already exists' }, { status: 409 });
  }
  data[category].push(product);
  await writeProducts(data);
  return NextResponse.json({ success: true, product });
}

// PUT: Update a product (expects {category, product})
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const validationResult = updateProductSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json({ errors: validationResult.error.flatten() }, { status: 400 });
  }

  const { category, product } = validationResult.data;

  const data = await readProducts();
  if (!data[category]) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  const idx = data[category].findIndex((p) => p.id === product.id);
  if (idx === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // Prevent updating the product ID
  if (data[category][idx].id !== product.id) {
     return NextResponse.json({ error: 'Cannot update product ID' }, { status: 400 });
  }


  // Merge the existing product data with the updated fields
  data[category][idx] = {
    ...data[category][idx],
    ...product,
  };

  await writeProducts(data);
  return NextResponse.json({ success: true, product: data[category][idx] });
}

// DELETE: Remove a product (expects {category, id})
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  // Simple validation for delete
  const deleteSchema = z.object({
    category: z.string().min(1, "Category is required for deletion"),
    id: z.string().uuid("Invalid product ID format for deletion"),
  });

  const validationResult = deleteSchema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json({ errors: validationResult.error.flatten() }, { status: 400 });
  }

  const { category, id } = validationResult.data;

  const data = await readProducts();
  if (!data[category]) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  const initialLength = data[category].length;
  data[category] = data[category].filter((p) => p.id !== id);

  if (data[category].length === initialLength) {
     return NextResponse.json({ error: 'Product not found in category' }, { status: 404 });
  }

  await writeProducts(data);
  return NextResponse.json({ success: true });
}