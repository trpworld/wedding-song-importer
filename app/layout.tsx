import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Heart, ShieldCheck, Music } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Wedding Song Collector | Submit Your Favorite Songs',
  description: 'Curate your magical wedding soundtrack easily for every ritual and event.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-100 bg-[#0f0a15] selection:bg-orange-500 selection:text-white min-h-screen flex flex-col">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0f0a15]/80 backdrop-blur-md px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-lg font-bold gradient-text tracking-wide block leading-none">
                  Wedding Beats
                </span>
                <span className="text-[10px] text-slate-400 font-sans tracking-widest uppercase">
                  Song Collector
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-3">
              <span className="text-xs font-medium text-amber-300/80 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                ✨ Official Music Curator
              </span>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 px-4 text-center text-xs text-slate-500">
          <div className="flex items-center justify-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for your Special Day</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
