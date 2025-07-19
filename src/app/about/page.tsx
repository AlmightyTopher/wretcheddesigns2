import Image from 'next/image';

export default function AboutPage() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
      <div className="text-center max-w-3xl mx-auto z-10 mb-10">
        <h1 className="glitch-header glitch font-header text-5xl md:text-7xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          About
        </h1>
      </div>
      <div className="w-full max-w-2xl mx-auto bg-matte-black/80 rounded-xl shadow-lg p-8 flex flex-col items-center mb-10">
        <h2 className="text-2xl font-header mb-4 text-acid-magenta">Our Story</h2>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <Image src="/alex-placeholder.png" alt="Julio" width={120} height={120} className="rounded-full border-4 border-electric-purple shadow-neon" />
          </div>
          <blockquote className="text-lg md:text-xl text-white/90 leading-relaxed text-left">
            <p className="mb-4">Hey! I'm Julio, the creative spirit behind this brand.<br />
            What started as a side hustle with cups turned into a full-blown lifestyle collection.</p>
            <p className="mb-4">Every design is crafted with intention — blending function, fun, and flair.<br />
            Thanks for supporting this journey. You're not just a customer — you're part of the vibe.</p>
          </blockquote>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <Image src="/coming-soon.png" alt="Coming Soon" width={400} height={400} />
      </div>
    </section>
  );
} 