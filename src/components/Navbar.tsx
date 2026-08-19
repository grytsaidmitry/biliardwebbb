import { useState } from 'react';
import { Menu, X, Send } from 'lucide-react';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { IMAGES } from '@/lib/images';

interface NavbarProps {
  clubName: string;
  telegramBot: string;
  onBookClick: () => void;
}

const NAV_LINKS = [
  { label: 'СТОЛЫ', href: '#tables' },
  { label: 'ЦЕНЫ', href: '#pricing' },
  { label: 'КЛУБ', href: '#about' },
  { label: 'ГАЛЕРЕЯ', href: '#gallery' },
  { label: 'КОНТАКТЫ', href: '#contacts' },
];

export function Navbar({ clubName, telegramBot, onBookClick }: NavbarProps) {
  const scrolled = useScrollPosition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-strong py-2.5 shadow-2xl shadow-black/50' : 'py-4 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-2 group"
        >
          <div className="relative w-9 h-9 rounded-lg flex items-center justify-center neon-border-green bg-black/40 overflow-hidden">
            <img src={IMAGES.iconBall} alt="Billiard" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-bold text-lg tracking-wider text-white group-hover:neon-text-green transition-all duration-300">
            {clubName}
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors duration-300 tracking-wide"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <a
            href={`https://t.me/${telegramBot}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/70 hover:text-cyan-400 transition-colors btn-outline rounded-lg"
          >
            <Send className="w-4 h-4" />
            TELEGRAM
          </a>
          <button
            onClick={onBookClick}
            className="btn-neon px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide font-display"
          >
            ЗАБРОНИРОВАТЬ
          </button>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-white/80 hover:text-white"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden glass-strong mt-2 mx-4 rounded-xl overflow-hidden animate-scale-in">
          <div className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="px-4 py-3 text-left text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            <a
              href={`https://t.me/${telegramBot}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              TELEGRAM
            </a>
            <button
              onClick={() => {
                setMobileOpen(false);
                onBookClick();
              }}
              className="btn-neon px-4 py-3 rounded-lg text-sm font-semibold tracking-wide font-display mt-2"
            >
              ЗАБРОНИРОВАТЬ СТОЛ
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
