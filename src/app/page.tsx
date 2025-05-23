import Image from 'next/image'; // Import the Image component
export default function Home() {
  const data = {
    tagline: 'Born from Chaos. Built to Disturb.',
  };
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
      <div className="absolute inset-0 -z-10 bg-hero-blocker">
        <Image // Use the Image component
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1350&q=80"
          alt="Cyberpunk neon city background placeholder"
          width={1350}
          height={800}
          priority
          className="object-cover w-full h-full brightness-75 contrast-150 blur-[2px] scale-105"
          style={{ filter: 'saturate(1.2) blur(2px)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111dd] to-[#1a0033ee] mix-blend-multiply" />
      </div>

      <div className="text-center max-w-3xl mx-auto z-10">
        <h1 className="glitch-header glitch font-header text-5xl md:text-7xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          {data.tagline}
        </h1>
        <p className="text-xl md:text-2xl font-mono text-white/90 mb-8">
          <span className="neon">Custom Printed Apparel · Art & Relics · Nightlife For The Unrepentant</span>
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-7">
          <a href="/shop" className="px-8 py-4 text-lg font-header bg-electric-purple text-white rounded-lg shadow-neon neon transition duration-200 hover:scale-105 hover:bg-acid-magenta focus:ring-4 focus:ring-acid-magenta/30 focus:outline-none">
            Shop Now
          </a>
          <a href="/gallery" className="px-8 py-4 text-lg font-header border-2 border-acid-magenta text-acid-magenta rounded-lg shadow-neon hover:bg-acid-magenta/20 neon transition duration-200 hover:scale-105 focus:ring-4 focus:ring-electric-purple/30 focus:outline-none">
            View Art Gallery
          </a>
        </div>
      </div>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-32 h-2 bg-gradient-to-r from-electric-purple via-acid-magenta to-neon-blue rounded-full animate-pulse shadow-neon opacity-50" />
    </section>
  );
}
