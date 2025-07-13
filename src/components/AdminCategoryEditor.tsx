import React, { useState, useEffect } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../lib/categoryService'; // Adjust import path
import { useSession } from 'next-auth/react'; // Import useSession
// Assuming other necessary imports are available

interface Category {
    id?: string;
    name: string;
    description?: string;
}

const AdminCategoryEditor: React.FC = () => {
    const { data: session, status } = useSession();
    const isAdmin = session?.user?.role === 'admin';

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // State for form/overlay
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
     // Placeholder for image file input, not directly used for categories
    const [selectedFile, setSelectedFile] = useState<File | null>(null);


    useEffect(() => {
        const fetchCategories = async () => {
            if (status === 'loading') return;
            if (!isAdmin) {
                setLoading(false);
                setError('You are not authorized to view this page.');
                return;
            }
            try {
                setLoading(true);
                const categoriesList = await getCategories();
                setCategories(categoriesList);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setError('Failed to load categories. Please try again.');
                setLoading(false);
            }
        };

        fetchCategories();
    }, [isAdmin, status]);

    const handleAddClick = () => {
        setIsEditing(true);
        setCurrentCategory(null); // Clear for new category
        setSelectedFile(null);
        setError(null);
    };

    const handleEditClick = (category: Category) => {
        setIsEditing(true);
        setCurrentCategory(category);
        setSelectedFile(null);
        setError(null);
    };

    const handleDeleteClick = async (categoryId: string) => {
        if (!isAdmin) {
            setError('You are not authorized to perform this action.');
            return;
        }
        if (confirm('Are you sure you want to delete this category?')) {
            setLoading(true);
            setError(null);
            try {
                await deleteCategory(categoryId);
                const updatedCategories = await getCategories();
                setCategories(updatedCategories);
                setLoading(false);
            } catch (err) {
                console.error("Error deleting category:", err);
                setError('Failed to delete category. Please try again.');
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isAdmin) {
            setError('You are not authorized to perform this action.');
            return;
        }

        // TODO: Add input validation and sanitization here

        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const categoryData: Omit<Category, 'id'> = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
        };

        try {
            if (currentCategory) {
                // Updating existing category
                await updateCategory(currentCategory.id!, categoryData);
                setIsEditing(false);
                setCurrentCategory(null);
            } else {
                // Adding new category
                await addCategory(categoryData);
                setIsEditing(false);
            }
            // Refresh the categories list
            const updatedCategories = await getCategories();
            setCategories(updatedCategories);
            setLoading(false);
        } catch (err) {
            console.error("Error saving category:", err);
            setError('Failed to save category. Please check your input and try again.');
            setLoading(false);
        }
    };

     // Placeholder for file change handler, not directly used for categories
     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    };


    if (status === 'loading') {
        return <div>Loading authentication status...</div>;
    }

    if (!isAdmin) {
        return <div>You are not authorized to view this page.</div>;
    }

    if (loading) {
        return <div>Loading categories...</div>;
    }

    if (error && !isEditing) { // Display error only if not editing
        return <div>Error: {error}</div>;
    }


    return (
        <div>
            <h2>Admin Category Editor</h2>
             {error && isEditing && <p style={{ color: 'red' }}>{error}</p>} {/* Display error in form */}
            {!isEditing ? (
                <div>
                    <button onClick={handleAddClick} disabled={loading}>Add New Category</button>
                    <h3>Existing Categories</h3>
                    <ul>
                        {categories.map(category => (
                            <li key={category.id}>
                                {category.name}
                                <button onClick={() => handleEditClick(category)} disabled={loading}>Edit</button>
                                <button onClick={() => handleDeleteClick(category.id!)} disabled={loading}>Delete</button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>
                    <h3>{currentCategory ? 'Edit Category' : 'Add New Category'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="name">Name:</label>
                            <input type="text" id="name" name="name" defaultValue={currentCategory?.name || ''} required />
                        </div>
                        <div>
                            <label htmlFor="description">Description:</label>
                            <textarea id="description" name="description" defaultValue={currentCategory?.description || ''} />
                        </div>
                         {/* Placeholder for image file input */}
                        <div>
                            <label htmlFor="image">Category Image (Placeholder):</label>
                            <input type="file" id="image" name="image" onChange={handleFileChange} disabled />
                        </div>
                        <button type="submit" disabled={loading}>{currentCategory ? 'Update Category' : 'Add Category'}</button>
                        <button type="button" onClick={() => setIsEditing(false)} disabled={loading}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminCategoryEditor;