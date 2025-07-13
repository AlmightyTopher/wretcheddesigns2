"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBlogPostBySlug, BlogPost } from "../../../lib/supabaseBlogService";
import ReactMarkdown from "react-markdown";

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) return;

      try {
        const blogPost = await getBlogPostBySlug(slug);
        setBlog(blogPost);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load blog post:", err);
        setError(err.message || "Could not load blog post. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-acid-magenta border-b-4 border-electric-purple"></div>
        <p className="mt-4 text-white/80">Loading...</p>
      </section>
    );
  }

  if (error || !blog) {
    return (
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full p-4">
        <h1 className="glitch-header glitch font-header text-3xl md:text-5xl mb-4 text-red-500">
          {error ? "Error" : "Not Found"}
        </h1>
        <p className="text-white/80 text-center mb-6">
          {error || "The blog post you're looking for could not be found."}
        </p>
        <Link href="/blogs" className="text-acid-magenta hover:underline">
          ← Back to Blog
        </Link>
      </section>
    );
  }

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
      <div className="w-full max-w-3xl mx-auto bg-matte-black/80 rounded-xl shadow-lg p-8 flex flex-col items-center mb-10">
        <Link href="/blogs" className="text-acid-magenta hover:underline mb-4 self-start">← Back to Blog</Link>
        {blog.cover_image_url && (
          <div className="w-full max-h-96 relative mb-6">
            <Image
              src={blog.cover_image_url}
              alt={blog.title}
              width={800}
              height={384}
              className="w-full max-h-96 object-cover rounded-lg border-2 border-acid-magenta"
              unoptimized={true}
              priority={true}
            />
          </div>
        )}
        <h1 className="text-4xl font-header text-acid-magenta mb-2 text-center">{blog.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {blog.tags?.map(tag => (
            <span key={tag} className="px-2 py-1 bg-acid-magenta/20 text-acid-magenta rounded text-xs font-mono">#{tag}</span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-white/60 mb-6">
          <span>By {blog.author_name || 'Admin'}</span>
          <span>·</span>
          <span>{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'Recently'}</span>
        </div>
        <article className="prose prose-invert prose-lg w-full max-w-none">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </article>
      </div>
    </section>
  );
}
