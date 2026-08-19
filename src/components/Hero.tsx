import { ArrowDown, Calendar } from 'lucide-react';
import { useMousePosition } from '@/hooks/useMousePosition';
import { IMAGES } from '@/lib/images';

interface HeroProps {
  clubName: string;
  tagline: string;
  subtitle: string;
  onBookClick: () => void;
  onTablesClick: () => void;
}

export function Hero({ clubName, tagline, subtitle, onBookClick, onTablesClick }: HeroProps) {
  const mouse = useMousePosition();

  const parallaxX = (mouse.x - 0.5) * 20;
  const parallaxY = (mouse.y - 0.5) * 20;

  return (
    <section className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Background image with parallax */}
      <div
        className="absolute inset-0 z-0 transition-transform duration-300 ease-out"
        style={{
          transform: `scale(1.08) translate(${parallaxX * -0.5}px, ${parallaxY * -0.5}px)`,
        }}
      >
        <img
          src={IMAGES.heroBatumi}
          alt="Night Batumi billiard club"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Cinematic gradient overlays */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-base via-transparent to-transparent" />

      {/* Grid overlay */}
      <div className="absolute inset-0 z-10 grid-bg opacity-30" />

      {/* Neon glow accents */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,255,157,0.12) 0%, transparent 70%)',
          transform: `translate(${parallaxX}px, ${parallaxY}px)`,
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,240,255,0.1) 0%, transparent 70%)',
          transform: `translate(${-parallaxX}px, ${-parallaxY}px)`,
        }}
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          <span className="font-display text-xs sm:text-sm tracking-[0.4em] text-cyan-400/80 uppercase">
            Batumi · Georgia
          </span>
        </div>

        <div className="mt-4 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-tight text-gradient leading-none">
            {clubName}
          </h1>
        </div>

        <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
          <p className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-wide">
            {tagline}
          </p>
        </div>

        <div className="mt-4 animate-fade-in-up" style={{ animationDelay: '0.7s', opacity: 0 }}>
          <p className="text-base sm:text-lg text-white/50 tracking-[0.2em] uppercase font-light">
            {subtitle}
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.9s', opacity: 0 }}>
          <button
            onClick={onBookClick}
            className="btn-neon px-8 py-4 rounded-xl font-display font-bold text-sm tracking-widest flex items-center justify-center gap-2 animate-pulse-glow"
          >
            <Calendar className="w-5 h-5" />
            ЗАБРОНИРОВАТЬ СТОЛ
          </button>
          <button
            onClick={onTablesClick}
            className="btn-outline px-8 py-4 rounded-xl font-display font-bold text-sm tracking-widest"
          >
            ПОСМОТРЕТЬ СТОЛЫ
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-float">
        <ArrowDown className="w-6 h-6 text-white/30" />
      </div>
    </section>
  );
}
