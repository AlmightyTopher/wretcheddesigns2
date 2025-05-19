import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

async function writeProducts(data: ProductsData) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

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
  const { category, product } = body;
  if (!category || !product || !product.id) {
    return NextResponse.json({ error: 'Missing category or product data' }, { status: 400 });
  }
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
  const { category, product } = body;
  if (!category || !product || !product.id) {
    return NextResponse.json({ error: 'Missing category or product data' }, { status: 400 });
  }
  const data = await readProducts();
  if (!data[category]) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  const idx = data[category].findIndex((p) => p.id === product.id);
  if (idx === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  data[category][idx] = product;
  await writeProducts(data);
  return NextResponse.json({ success: true, product });
}

// DELETE: Remove a product (expects {category, id})
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { category, id } = body;
  if (!category || !id) {
    return NextResponse.json({ error: 'Missing category or id' }, { status: 400 });
  }
  const data = await readProducts();
  if (!data[category]) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  const idx = data[category].findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  data[category].splice(idx, 1);
  await writeProducts(data);
  return NextResponse.json({ success: true });
} 