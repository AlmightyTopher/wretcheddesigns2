'use client';

import { Component, useEffect, useState, ErrorInfo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface GalleryItem {
  id: string;
  downloadURL: string;
  fileName: string;
}

// Simple Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Caught error in AdminGalleryPage:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong loading the gallery editor.</h2>;
    }
    return this.props.children;
  }
}

const AdminGalleryPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    // Assuming session.user.isAdmin indicates admin
    if (!session || !(session.user as any)?.isAdmin) {
      router.push('/admin'); // Redirect to admin login or dashboard if not authorized
    } else {
      fetchGalleryItems();
    }
  }, [session, status, router]);

  const fetchGalleryItems = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/gallery');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setGalleryItems(data);
    } catch (err: any) {
      setFetchError(err.message);
      console.error('Error fetching gallery items:', fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setUploadError(null); // Clear previous upload errors on new file selection
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }

    setLoading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Image uploaded successfully, now fetch the updated gallery
      await fetchGalleryItems();
      setSelectedFile(null); // Clear selected file
    } catch (err: any) {
      setUploadError(err.message);
      console.error('Error uploading image:', uploadError);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setFetchError(null); // Use fetchError for operations on existing items
    try {
      const res = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // Image deleted successfully, fetch the updated gallery
      await fetchGalleryItems();
    } catch (err: any) {
      setFetchError(err.message);
      console.error('Error deleting image:', fetchError);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading authentication...</div>;
  }

  // Assuming session and isAdmin check in useEffect handles unauthorized redirect
  if (!session || !(session.user as any)?.isAdmin) {
     return <div>Redirecting...</div>;
  }


  // Render the main content within the ErrorBoundary
  return (
    <ErrorBoundary>
      <div style={{ padding: '20px' }}>
        <h1>Admin Gallery Management</h1>

        <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px' }}>
          <h2>Upload New Image</h2>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button onClick={handleUpload} disabled={!selectedFile || loading}>
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
          {uploadError && <p style={{ color: 'red' }}>Upload failed: {uploadError}</p>}
        </div>

        <h2>Existing Gallery Items</h2>
        {loading && <p>Loading gallery...</p>}
        {fetchError && <p style={{ color: 'red' }}>Error fetching or deleting images: {fetchError}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {galleryItems.map((item) => (
            <div key={item.id} style={{ border: '1px solid #eee', padding: '10px', position: 'relative' }}>
              <img src={item.downloadURL} alt={`Gallery Image ${item.id}`} style={{ width: '150px', height: '150px', objectFit: 'cover' }} />
              <button
                onClick={() => handleDelete(item.id)}
                disabled={loading}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  backgroundColor: 'rgba(255, 0, 0, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '25px',
                  height: '25px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminGalleryPage;