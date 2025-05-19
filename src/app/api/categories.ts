import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

const DATA_PATH = path.join(process.cwd(), 'data', 'categories.json');

const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const createCategorySchema = categorySchema.omit({ id: true }).extend({
  id: z.string().uuid().optional(), // Allow client to provide id, but validate as uuid if present
});

const updateCategorySchema = categorySchema.partial().extend({
  id: z.string().uuid(), // ID is required for update
}).refine((data) => Object.keys(data).length > 1, {
  message: "At least one field (name or description) must be provided for update.",
});


type Category = z.infer<typeof categorySchema>;

async function readCategories(): Promise<Category[]> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof Error && (error as any).code === 'ENOENT') {
      return []; // Return empty array if file doesn't exist
    }
    throw error;
  }
}

async function writeCategories(data: Category[]) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// GET: /api/categories or /api/categories?id=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  try {
    const data = await readCategories();
    if (id) {
      const found = data.find((c) => c.id === id);
      if (found) return NextResponse.json(found);
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading categories:', error);
    return NextResponse.json({ error: 'Error reading categories' }, { status: 500 });
  }
}

// POST: Add a new category (expects {id?, name, description?})
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = createCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const newCategoryData = validation.data;
    const newCategoryId = newCategoryData.id || crypto.randomUUID();

    const data = await readCategories();
    if (data.some((c) => c.id === newCategoryId)) {
      return NextResponse.json({ error: 'Category with this ID already exists' }, { status: 409 });
    }

    const newCategory: Category = {
      id: newCategoryId,
      name: newCategoryData.name,
      description: newCategoryData.description,
    };

    data.push(newCategory);
    await writeCategories(data);
    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Error creating category' }, { status: 500 });
  }
}

// PUT: Update a category (expects {id, name?, description?})
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = updateCategorySchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const updatedCategoryData = validation.data;

    const data = await readCategories();
    const idx = data.findIndex((c) => c.id === updatedCategoryData.id);

    if (idx === -1) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Prevent editing of sensitive fields like id (already handled by schema)
    // Update only allowed fields
    if (updatedCategoryData.name !== undefined) {
        data[idx].name = updatedCategoryData.name;
    }
    if (updatedCategoryData.description !== undefined) {
        data[idx].description = updatedCategoryData.description;
    }


    await writeCategories(data);
    return NextResponse.json({ success: true, category: data[idx] });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'Error updating category' }, { status: 500 });
  }
}

// DELETE: Remove a category (expects {id})
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const deleteSchema = z.object({
      id: z.string().uuid(),
    });
    const validation = deleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.errors }, { status: 400 });
    }

    const { id } = validation.data;

    const data = await readCategories();
    const initialLength = data.length;
    const filteredData = data.filter((c) => c.id !== id);

    if (filteredData.length === initialLength) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await writeCategories(filteredData);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Error deleting category' }, { status: 500 });
  }
}