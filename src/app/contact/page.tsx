import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import Image from 'next/image';

export default function ContactPage() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full overflow-hidden p-4">
      <div className="text-center max-w-3xl mx-auto z-10 mb-10">
        <h1 className="glitch-header glitch font-header text-5xl md:text-7xl mb-7 neon leading-tight tracking-[0.11em]" style={{ color: '#3A7CA5' }}>
          Contact
        </h1>
      </div>
      <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-6 mb-10">
        <div className="bg-matte-black/80 rounded-xl shadow-lg p-6 w-full flex flex-col items-center">
          <h2 className="text-2xl font-header mb-4 text-acid-magenta">Stay in Touch</h2>
          <div className="flex flex-col gap-3 text-lg text-white/90">
            <div className="flex items-center gap-3"><FaEnvelope className="text-acid-magenta" /> <span>Email: hello@vibedreamstudio.com</span></div>
            <div className="flex items-center gap-3"><FaPhone className="text-acid-magenta" /> <span>Phone: (555) 123-7890</span></div>
            <div className="flex items-center gap-3"><FaMapMarkerAlt className="text-acid-magenta" /> <span>Location: Austin, TX</span></div>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <Image src="/coming-soon.png" alt="Coming Soon" width={400} height={400} />
      </div>
    </section>
  );
} 