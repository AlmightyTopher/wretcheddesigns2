import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../lib/productService'; // Adjust the import path as needed
import { uploadImageToFirebaseStorage } from '../lib/storageService'; // Adjust the import path as needed
import { deleteObject, ref } from "firebase/storage";
import { getStorage } from "firebase/storage";

const storage = getStorage();

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

const AdminProductEditor: React.FC = () => {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [productsPerPage] = useState<number>(10); // Number of products per page
  const [lastDoc, setLastDoc] = useState<any>(null); // Firestore DocumentSnapshot of the last item on the current page
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Omit<Product, 'id'>>({ name: '', description: '', price: 0, imageUrl: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (status === 'loading') return;
      if (!isAdmin) {
        setLoading(false);
        setError('You are not authorized to view this page.');
        return;
      }
      try {
        setLoading(true); // Keep loading true while fetching
        // Fetch products for the current page
        const { products: productsData, lastDoc: newLastDoc } = await getProducts(productsPerPage, currentPage === 1 ? undefined : lastDoc);
        setProducts(productsData);
        setLastDoc(newLastDoc); // Store the last document for pagination
      } catch (err) {
        console.error("Error fetching products:", err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false); // Set loading to false after fetch
      }
    };

    fetchProducts();
  }, [isAdmin, status]);

  const openModal = (product?: Product) => {
    setCurrentProduct(product || null);
    if (product) {
      setProductFormData({ name: product.name, description: product.description, price: product.price, imageUrl: product.imageUrl || '' });
    } else {
      setProductFormData({ name: '', description: '', price: 0, imageUrl: '' });
    }
    setSelectedFile(null);
    setIsModalOpen(true);
    setError(null); // Clear errors when opening modal
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
    setProductFormData({ name: '', description: '', price: 0, imageUrl: '' });
    setSelectedFile(null);
    setError(null); // Clear errors when closing modal
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductFormData({ ...productFormData, [name]: name === 'price' ? parseFloat(value) : value });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSaveProduct = async () => {
    if (!isAdmin) {
        setError('You are not authorized to perform this action.');
        return;
    }

    // Basic validation
    if (!productFormData.name || !productFormData.description || productFormData.price <= 0) {
      setError('Please fill in all required fields (Name, Description, Price).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let imageUrl = productFormData.imageUrl;
      if (selectedFile) {
        // Upload new image
        const storagePath = `products/${selectedFile.name}`;
        imageUrl = await uploadImageToFirebaseStorage(selectedFile, storagePath);

        // Optionally delete old image if updating
        if (currentProduct?.imageUrl && currentProduct.imageUrl !== imageUrl) {
          const oldImageRef = ref(storage, currentProduct.imageUrl);
           try {
             await deleteObject(oldImageRef);
           } catch (deleteError) {
             console.error("Error deleting old image:", deleteError);
             // Continue without blocking if old image deletion fails
           }
        }
      } else if (currentProduct && productFormData.imageUrl === '' && currentProduct.imageUrl) {
         // Case where image is removed
         const oldImageRef = ref(storage, currentProduct.imageUrl);
         try {
           await deleteObject(oldImageRef);
         } catch (deleteError) {
            console.error("Error deleting removed image:", deleteError);
            // Continue without blocking
         }
      }


      const productToSave = { ...productFormData, imageUrl };

      if (currentProduct?.id) {
        await updateProduct(currentProduct.id, productToSave);
      } else {
        await addProduct(productToSave);
      }

      const { products: updatedProducts } = await getProducts(productsPerPage, currentPage === 1 ? undefined : lastDoc); // Refresh current page after save
      setProducts(updatedProducts);
      closeModal();
    } catch (err) {
      console.error("Error saving product:", err);
      setError(`Failed to save product: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string, imageUrl?: string) => {
    if (!isAdmin) {
        setError('You are not authorized to perform this action.');
        return;
    }
    if (confirm('Are you sure you want to delete this product?')) {
      setLoading(true);
      setError(null);
      try {
        await deleteProduct(productId);
        if (imageUrl) {
           const imageRef = ref(storage, imageUrl);
            try {
              await deleteObject(imageRef);
            } catch (deleteError) {
              console.error("Error deleting product image from storage:", deleteError);
              // Continue without blocking if image deletion fails
            }
        }

        const { products: updatedProducts } = await getProducts(productsPerPage, currentPage === 1 ? undefined : lastDoc); // Refresh current page after delete
        setProducts(updatedProducts);
      } catch (err) {
        console.error("Error deleting product:", err);
        setError(`Failed to delete product: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNextPage = () => {
      if (lastDoc) {
          setCurrentPage(prev => prev + 1);
      }
  };

  const handlePreviousPage = () => {
      if (currentPage > 1) {
          setCurrentPage(prev => prev - 1);
      }
  };
    if (status === 'loading') {
    return <div>Loading authentication status...</div>;
  }

  if (!isAdmin) {
    return <div>You are not authorized to view this page.</div>;
  }


  if (loading && !isModalOpen) {
    return <div>Loading products...</div>;
  }

  if (error && !loading && !isModalOpen) {
    return <div>Error: {error}</div>;
  }


  return (
    <div>
      <h2>Admin Product Editor</h2>
      <button onClick={() => openModal()}>Add New Product</button>

      {error && isModalOpen && <p style={{ color: 'red' }}>{error}</p>}
       {loading && isModalOpen && <p>Saving...</p>}


      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{currentProduct ? 'Edit Product' : 'Add Product'}</h3>
            <div>
              <label>Name:</label>
              <input type="text" name="name" value={productFormData.name} onChange={handleInputChange} />
            </div>
            <div>
              <label>Description:</label>
              <textarea name="description" value={productFormData.description} onChange={handleInputChange}></textarea>
            </div>
            <div>
              <label>Price:</label>
              <input type="number" name="price" value={productFormData.price} onChange={handleInputChange} step="0.01" />
            </div>
             <div>
              <label>Image:</label>
              <input type="file" onChange={handleFileSelect} />
               {productFormData.imageUrl && !selectedFile && (
                 <div>
                   Current Image: <img src={productFormData.imageUrl} alt="Current Product Image" style={{ width: '50px', height: '50px', objectFit: 'cover' }}/>
                   <button onClick={() => setProductFormData({...productFormData, imageUrl: ''})}>Remove Image</button>
                 </div>
               )}
                 {selectedFile && <p>Selected: {selectedFile.name}</p>}
            </div>
            <button onClick={handleSaveProduct} disabled={loading}>Save</button>
            <button onClick={closeModal} disabled={loading}>Cancel</button>
          </div>
        </div>
      )}

      <h3>Existing Products</h3>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.imageUrl && <img src={product.imageUrl} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />}</td>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.price.toFixed(2)}</td>
              <td>
                <button onClick={() => openModal(product)}>Edit</button>
                <button onClick={() => handleDeleteProduct(product.id!, product.imageUrl)} disabled={loading}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        <div>
           <button onClick={handlePreviousPage} disabled={currentPage === 1 || loading}>Previous Page</button>
           <button onClick={handleNextPage} disabled={!lastDoc || loading}>Next Page</button>
        </div>
    </div>
  );
};

export default AdminProductEditor;