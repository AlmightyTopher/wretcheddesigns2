"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Blog } from "../../pages/api/blogs";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  useEffect(() => {
    fetch("/api/blogs").then(res => res.json()).then(setBlogs);
  }, []);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
      <div className="text-center max-w-3xl mx-auto z-10 mb-10">
        <h1 className="glitch-header glitch font-header text-5xl md:text-7xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          Blog
        </h1>
      </div>
      <div className="w-full max-w-6xl mx-auto grid gap-8 grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        {blogs.map(blog => (
          <Link
            key={blog.slug}
            href={`/blogs/${blog.slug}`}
            className="group block bg-matte-black/80 rounded-xl shadow-lg p-6 flex flex-col gap-4 hover:scale-[1.03] hover:shadow-2xl transition-transform border border-acid-magenta/30 hover:border-acid-magenta"
            style={{ textDecoration: 'none' }}
          >
            <div className="w-full aspect-[3/2] bg-gradient-to-br from-matte-black to-electric-purple rounded-lg overflow-hidden mb-3 flex items-center justify-center">
              {blog.imageURL ? (
                <img src={blog.imageURL} alt={blog.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
              ) : (
                <span className="text-5xl text-acid-magenta">📝</span>
              )}
            </div>
            <h2 className="text-2xl font-header text-acid-magenta mb-1">{blog.title}</h2>
            <div className="text-white/80 mb-2">{blog.description}</div>
            <div className="flex flex-wrap gap-2 mb-2">
              {blog.tags?.map(tag => (
                <span key={tag} className="px-2 py-1 bg-acid-magenta/20 text-acid-magenta rounded text-xs font-mono">#{tag}</span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60 mt-auto">
              <span>By {blog.author}</span>
              <span>·</span>
              <span>{new Date(blog.publishDate).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
} 