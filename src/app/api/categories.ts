import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'categories.json');

type Category = {
  id: string;
  name: string;
};

async function readCategories(): Promise<Category[]> {
  const data = await fs.readFile(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

async function writeCategories(data: Category[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET: /api/categories or /api/categories?id=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const data = await readCategories();
  if (id) {
    const found = data.find((c) => c.id === id);
    if (found) return NextResponse.json(found);
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json(data);
}

// POST: Add a new category (expects {id, name})
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, name } = body;
  if (!id || !name) {
    return NextResponse.json({ error: 'Missing id or name' }, { status: 400 });
  }
  const data = await readCategories();
  if (data.some((c) => c.id === id)) {
    return NextResponse.json({ error: 'Category with this ID already exists' }, { status: 409 });
  }
  data.push({ id, name });
  await writeCategories(data);
  return NextResponse.json({ success: true, category: { id, name } });
}

// PUT: Update a category (expects {id, name})
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, name } = body;
  if (!id || !name) {
    return NextResponse.json({ error: 'Missing id or name' }, { status: 400 });
  }
  const data = await readCategories();
  const idx = data.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  data[idx].name = name;
  await writeCategories(data);
  return NextResponse.json({ success: true, category: data[idx] });
}

// DELETE: Remove a category (expects {id})
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  const data = await readCategories();
  const idx = data.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  data.splice(idx, 1);
  await writeCategories(data);
  return NextResponse.json({ success: true });
} 