import React, { useState, useEffect } from 'react';
import { getAllBlogPosts, addBlogPost, updateBlogPost, deleteBlogPost, getBlogPostById, BlogPost, NewBlogPostData, UpdateBlogPostData } from '../lib/supabaseBlogService';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const AdminBlogEditor: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [currentCoverImageUrl, setCurrentCoverImageUrl] = useState<string>('');

  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    if (status === 'loading') return;
    if (isAdmin) {
      fetchBlogPosts();
    } else {
      setLoading(false);
      if (status === 'authenticated') {
        setError("You do not have administrator access to this feature.");
      }
    }
  }, [isAdmin, status]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const posts = await getAllBlogPosts(false); // Get all posts, including drafts
      setBlogPosts(posts);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching blog posts:', err);
      setError(err.message || 'Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const resetForm = () => {
    setTitle('');
    setSlug('');
    setContent('');
    setExcerpt('');
    setTags('');
    setIsPublished(false);
    setAuthorName('');
    setCoverImageFile(null);
    setCurrentCoverImageUrl('');
    setEditingPost(null);
    setIsEditing(false);
  };

  const handleEdit = async (post: BlogPost) => {
    try {
      const fullPost = await getBlogPostById(post.id!);
      if (!fullPost) {
        setError('Post not found');
        return;
      }

      setEditingPost(fullPost);
      setTitle(fullPost.title);
      setSlug(fullPost.slug);
      setContent(fullPost.content);
      setExcerpt(fullPost.excerpt || '');
      setTags(fullPost.tags?.join(', ') || '');
      setIsPublished(fullPost.is_published);
      setAuthorName(fullPost.author_name || '');
      setCurrentCoverImageUrl(fullPost.cover_image_url || '');
      setIsEditing(true);
    } catch (err: any) {
      setError(err.message || 'Failed to load blog post for editing.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('You are not authorized to perform this action.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      const finalSlug = slug || generateSlug(title);

      if (isEditing && editingPost) {
        const updateData: UpdateBlogPostData = {
          title,
          slug: finalSlug,
          content,
          excerpt: excerpt || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
          is_published: isPublished,
          author_name: authorName || undefined,
          coverImageFile,
        };

        await updateBlogPost(editingPost.id!, updateData);
      } else {
        const newPostData: NewBlogPostData = {
          title,
          slug: finalSlug,
          content,
          excerpt: excerpt || undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
          is_published: isPublished,
          author_name: authorName || undefined,
          coverImageFile,
        };

        await addBlogPost(newPostData);
      }

      await fetchBlogPosts();
      resetForm();
      console.log(`Blog post ${isEditing ? 'updated' : 'created'} successfully.`);
    } catch (err: any) {
      console.error('Error saving blog post:', err);
      setError(err.message || 'Failed to save blog post.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (postId: string, title: string) => {
    if (!isAdmin) {
      setError('You are not authorized to perform this action.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      setError(null);
      try {
        await deleteBlogPost(postId);
        setBlogPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
        console.log(`Blog post "${title}" deleted successfully.`);
      } catch (err: any) {
        console.error('Error deleting blog post:', err);
        setError(err.message || `Failed to delete blog post "${title}".`);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImageFile(e.target.files[0]);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <span className="inline-block animate-spin mr-2">&#9696;</span>
        Loading blog editor...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center text-red-500">
        {error || "You do not have permission to access this page."}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6 text-pink-700">Admin Blog Editor</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
          {error}
        </div>
      )}

      {/* Blog Post Form */}
      <div className="mb-8 p-6 border rounded shadow-sm bg-gray-50">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!isEditing) setSlug(generateSlug(e.target.value));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="Enter blog post title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="url-friendly-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              placeholder="Short description for previews"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              placeholder="Write your blog post content here (Markdown supported)"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                placeholder="Author name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
            />
            {(currentCoverImageUrl || coverImageFile) && (
              <div className="mt-2 relative w-48 h-32">
                <Image
                  src={coverImageFile ? URL.createObjectURL(coverImageFile) : currentCoverImageUrl}
                  alt="Cover preview"
                  fill
                  className="object-cover rounded border"
                  unoptimized={true}
                />
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
              Publish immediately
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2 rounded-md text-white font-semibold transition-all ${
                saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {saving ? 'Saving...' : (isEditing ? 'Update Post' : 'Create Post')}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-semibold transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Existing Blog Posts */}
      <div className="p-6 border rounded shadow-sm bg-gray-50">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Existing Blog Posts</h3>

        {blogPosts.length === 0 ? (
          <p className="text-gray-500">No blog posts yet. Create your first one above!</p>
        ) : (
          <div className="space-y-4">
            {blogPosts.map((post) => (
              <div key={post.id} className="flex items-center justify-between p-4 bg-white rounded border">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{post.title}</h4>
                  <div className="text-sm text-gray-500 mt-1">
                    <span>Slug: {post.slug}</span>
                    <span className="mx-2">•</span>
                    <span>{post.is_published ? 'Published' : 'Draft'}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(post)}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-semibold transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.id!, post.title)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-semibold transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBlogEditor;
