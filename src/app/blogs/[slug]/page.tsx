"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Blog } from "../../../pages/api/blogs";
import ReactMarkdown from "react-markdown";

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  useEffect(() => {
    fetch(`/api/blogs`).then(res => res.json()).then((blogs: Blog[]) => {
      setBlog(blogs.find(b => b.slug === slug) || null);
    });
  }, [slug]);

  if (!blog) return <div className="text-center p-10 text-white">Loading...</div>;

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
      <div className="w-full max-w-3xl mx-auto bg-matte-black/80 rounded-xl shadow-lg p-8 flex flex-col items-center mb-10">
        <Link href="/blogs" className="text-acid-magenta hover:underline mb-4 self-start">← Back to Blog</Link>
        {blog.imageURL && (
          <img src={blog.imageURL} alt={blog.title} className="w-full max-h-96 object-cover rounded-lg mb-6 border-2 border-acid-magenta" />
        )}
        <h1 className="text-4xl font-header text-acid-magenta mb-2 text-center">{blog.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {blog.tags?.map(tag => (
            <span key={tag} className="px-2 py-1 bg-acid-magenta/20 text-acid-magenta rounded text-xs font-mono">#{tag}</span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-white/60 mb-6">
          <span>By {blog.author}</span>
          <span>·</span>
          <span>{new Date(blog.publishDate).toLocaleDateString()}</span>
        </div>
        <article className="prose prose-invert prose-lg w-full max-w-none">
          <ReactMarkdown>{blog.content}</ReactMarkdown>
        </article>
      </div>
    </section>
  );
} 