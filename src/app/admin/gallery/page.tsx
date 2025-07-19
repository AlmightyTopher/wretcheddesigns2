"use client";

import AdminGalleryEditor from "@/components/AdminGalleryEditor";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminGalleryPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-acid-magenta"></div>
        <p className="ml-4 text-xl">Loading...</p>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-4xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-white/80 mb-6">You do not have permission to access this page.</p>
          <Link href="/admin" className="text-acid-magenta hover:underline">
            ← Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-white">
      <div className="mb-6">
        <Link href="/admin" className="text-acid-magenta hover:underline mb-4 inline-block">
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-acid-magenta">Gallery Management</h1>
        <p className="text-white/80 mt-2">Upload, manage, and organize gallery images.</p>
      </div>

      <AdminGalleryEditor />
    </div>
  );
}
