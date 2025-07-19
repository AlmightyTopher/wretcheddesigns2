"use client";

import AdminLogin from "@/components/AdminLogin";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation"; // Import useSearchParams
import Link from "next/link";
import React, { useEffect } from "react";

// Placeholder for the actual Admin Dashboard components
const AdminDashboard = () => {
  const { data: session } = useSession();
  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="mb-2">Welcome, {session?.user?.name || session?.user?.email}!</p>
      <p className="mb-4">You are logged in as an administrator.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Link href="/admin/gallery" className="block p-6 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-md transition-colors">
          <h2 className="text-xl font-semibold text-acid-magenta mb-2">Manage Gallery</h2>
          <p className="text-gray-300">Upload, edit, and delete gallery images.</p>
        </Link>
        <Link href="/admin/blog" className="block p-6 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-md transition-colors">
          <h2 className="text-xl font-semibold text-acid-magenta mb-2">Manage Blog</h2>
          <p className="text-gray-300">Create, edit, and publish blog posts.</p>
        </Link>
        <Link href="/shop/admin" className="block p-6 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-md transition-colors">
          <h2 className="text-xl font-semibold text-acid-magenta mb-2">Manage Products</h2>
          <p className="text-gray-300">Add, edit, and manage shop products and categories.</p>
        </Link>
        {/* Add more links to other admin sections as needed */}
      </div>

      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="mt-8 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams(); // Get URL search parameters
  const error = searchParams.get("error");

  // If session is loading, show a loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-acid-magenta"></div>
        <p className="ml-4 text-xl">Loading session...</p>
      </div>
    );
  }

  // If the user is authenticated and has the admin role, show the dashboard
  if (session && (session.user as any)?.role === 'admin') {
    return <AdminDashboard />;
  }

  // If not authenticated or not an admin, show the login form
  // This will also be the default view if NextAuth redirects here for sign-in
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-acid-magenta mb-8 glitch glitch-header">Admin Access</h1>
        {error && (
          <div className="bg-red-700 border border-red-900 text-white px-4 py-3 rounded-lg relative mb-6 shadow-lg" role="alert">
            <strong className="font-bold">Login Error: </strong>
            <span className="block sm:inline">
              {error === "CredentialsSignin"
                ? "Invalid email or password. Please try again."
                : error === "auth"
                ? "Authentication failed. Please try again or contact support."
                : "An unknown error occurred during login."}
            </span>
          </div>
        )}
        <AdminLogin />
        <p className="text-center mt-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-acid-magenta underline transition-colors">
            &larr; Back to Main Site
          </Link>
        </p>
      </div>
    </div>
  );
}
