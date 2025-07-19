"use client";
import React, { createContext, useContext, useState } from "react";

export type AdminContextType = {
  authenticated: boolean;
  setAuthenticated: (v: boolean) => void;
  globalColors: Record<string, string>;
  setGlobalColor: (key: string, value: string) => void;
  // Add more as needed (drafts, etc)
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [globalColors, setGlobalColors] = useState<Record<string, string>>({});

  function setGlobalColor(key: string, value: string) {
    setGlobalColors(prev => ({ ...prev, [key]: value }));
  }

  return (
    <AdminContext.Provider value={{ authenticated, setAuthenticated, globalColors, setGlobalColor }}>
      {children}
    </AdminContext.Provider>
  );
} 