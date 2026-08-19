import { Send } from 'lucide-react';
import { IMAGES } from '@/lib/images';

interface FooterProps {
  clubName: string;
  telegramBot: string;
}

export function Footer({ clubName, telegramBot }: FooterProps) {
  return (
    <footer className="relative py-12 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="absolute inset-0 grid-bg opacity-10" />
      <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg glass neon-border-green overflow-hidden">
            <img src={IMAGES.iconBall} alt="Billiard" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-bold text-sm tracking-wider text-white">{clubName}</span>
        </div>

        <p className="text-xs text-white/30 tracking-wide text-center">
          BATUMI · GEORGIA · {new Date().getFullYear()}
        </p>

        <a
          href={`https://t.me/${telegramBot}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-white/50 hover:text-cyan-400 transition-colors"
        >
          <Send className="w-4 h-4" />
          @{telegramBot}
        </a>
      </div>
    </footer>
  );
}
