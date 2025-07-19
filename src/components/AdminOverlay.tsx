"use client";
import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function AdminOverlay({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = session?.user && (session.user as any).role === "admin";

  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center">
        <div className="bg-matte-black p-8 rounded-xl shadow-lg flex flex-col gap-4 min-w-[320px] items-center">
          <h2 className="text-2xl font-header text-acid-magenta mb-2 text-center">Admin Login</h2>
          <button
            onClick={() => signIn()}
            className="px-4 py-2 bg-acid-magenta text-white rounded shadow hover:bg-electric-purple transition font-bold"
          >
            Sign in as Admin
          </button>
        </div>
      </div>
    );
  }

  async function handleDone() {
    if (window.confirm("Are you done editing?")) {
      window.location.reload();
    } else {
      signOut();
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 pointer-events-auto" style={{ pointerEvents: 'auto' }}>
      <div className="absolute inset-0 z-[99999] flex flex-col items-center justify-start h-full" style={{ position: 'absolute', pointerEvents: 'none' }}>
        {/* Done button at the bottom center */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100000] flex justify-center w-full pointer-events-none">
          <button
            onClick={handleDone}
            className="pointer-events-auto px-8 py-4 text-2xl font-bold bg-acid-magenta text-white rounded-xl shadow-lg border-4 border-black hover:bg-electric-purple transition focus:outline-none focus:ring-4 focus:ring-acid-magenta"
            style={{ minWidth: 200 }}
          >
            Done
          </button>
        </div>
        {children}
      </div>
    </div>
  );
} 