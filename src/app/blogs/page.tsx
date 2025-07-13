"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getAllBlogPosts, BlogPost } from "../../lib/supabaseBlogService";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogPosts = await getAllBlogPosts(true); // Only published posts
        setBlogs(blogPosts);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load blog posts:", err);
        setError(err.message || "Could not load blog posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-acid-magenta border-b-4 border-electric-purple"></div>
        <p className="mt-4 text-white/80">Loading Blog Posts...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full p-4">
        <h1 className="glitch-header glitch font-header text-3xl md:text-5xl mb-4 text-red-500">Error</h1>
        <p className="text-white/80 text-center mb-6">{error}</p>
      </section>
    );
  }

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
      <div className="text-center max-w-3xl mx-auto z-10 mb-10">
        <h1 className="glitch-header glitch font-header text-5xl md:text-7xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          Blog
        </h1>
      </div>

      {blogs.length === 0 && !loading && (
        <div className="text-center text-white/70 text-xl">
          <p>No blog posts have been published yet. Check back soon!</p>
        </div>
      )}

      <div className="w-full max-w-6xl mx-auto grid gap-8 grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        {blogs.map(blog => (
          <Link
            key={blog.slug}
            href={`/blogs/${blog.slug}`}
            className="group block bg-matte-black/80 rounded-xl shadow-lg p-6 flex flex-col gap-4 hover:scale-[1.03] hover:shadow-2xl transition-transform border border-acid-magenta/30 hover:border-acid-magenta"
            style={{ textDecoration: 'none' }}
          >
            <div className="w-full aspect-[3/2] bg-gradient-to-br from-matte-black to-electric-purple rounded-lg overflow-hidden mb-3 flex items-center justify-center relative">
              {blog.cover_image_url ? (
                <Image
                  src={blog.cover_image_url}
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  unoptimized={true}
                />
              ) : (
                <span className="text-5xl text-acid-magenta">📝</span>
              )}
            </div>
            <h2 className="text-2xl font-header text-acid-magenta mb-1">{blog.title}</h2>
            <div className="text-white/80 mb-2">{blog.excerpt || "Read more..."}</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {blog.tags?.map(tag => (
                <span key={tag} className="px-2 py-1 bg-acid-magenta/20 text-acid-magenta rounded text-xs font-mono">#{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60 mt-auto">
              <span>By {blog.author_name || 'Admin'}</span>
              <span>·</span>
              <span>{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'Recently'}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
