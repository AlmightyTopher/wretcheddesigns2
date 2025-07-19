"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';

export default function AboutAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    router.push('/api/auth/signin');
    return null; // or a loading spinner, or nothing
  }
  // Demo state for editing
  const [title, setTitle] = useState("Our Story");
  const [bio, setBio] = useState("Hey! I'm Julio, the creative spirit behind this brand.\nWhat started as a side hustle with cups turned into a full-blown lifestyle collection.\nEvery design is crafted with intention — blending function, fun, and flair.\nThanks for supporting this journey. You're not just a customer — you're part of the vibe.");
  const [profile, setProfile] = useState("/alex-placeholder.png");

  // Dynamically import components used only in the admin section
  const DynamicAdminOverlay = dynamic(() => import('../../../components/AdminOverlay'));
  const DynamicEditableText = dynamic(() => import('../../../components/EditableText'));
  const DynamicEditableImage = dynamic(() => import('../../../components/EditableImage'));

  // Render a loading state or null while dynamic components are loading
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <DynamicAdminOverlay>
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
        <div className="w-full max-w-2xl mx-auto bg-matte-black/80 rounded-xl shadow-lg p-8 flex flex-col items-center mb-10">
          <DynamicEditableText value={title} onSave={setTitle} className="text-2xl font-header mb-4 text-acid-magenta" />
          <div className="flex flex-col md:flex-row items-center gap-6">
            <DynamicEditableImage src={profile} onSave={setProfile} alt="Profile" />
            <blockquote className="text-lg md:text-xl text-white/90 leading-relaxed text-left">
              <DynamicEditableText value={bio} onSave={setBio} className="mb-4 block whitespace-pre-line" />
            </blockquote>
          </div>
        </div>
      </section>
    </DynamicAdminOverlay>
  );
} 