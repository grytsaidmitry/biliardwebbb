import { useReveal } from '@/hooks/useReveal';
import { IMAGES } from '@/lib/images';

interface AboutSectionProps {
  aboutText: string;
}

export function AboutSection({ aboutText }: AboutSectionProps) {
  const { ref, revealed } = useReveal();

  return (
    <section id="about" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[500px] h-[500px] radial-glow pointer-events-none" />

      <div ref={ref} className={`relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center reveal ${revealed ? 'revealed' : ''}`}>
        {/* Image */}
        <div className="relative">
          <div className="relative rounded-2xl overflow-hidden group">
            <img
              src={IMAGES.billiardNeon}
              alt="Billiard club interior"
              className="w-full h-[400px] sm:h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-base via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-base/50" />
          </div>
          {/* Floating accent card */}
          <div className="absolute -bottom-6 -right-6 glass-strong neon-border-cyan rounded-xl p-4 hidden sm:block animate-float">
            <p className="font-display text-3xl font-bold neon-text-cyan">6</p>
            <p className="text-xs text-white/50 tracking-wider uppercase">Столов</p>
          </div>
        </div>

        {/* Text */}
        <div>
          <span className="font-display text-xs tracking-[0.4em] text-cyan-400/60 uppercase">О клубе</span>
          <h2 className="mt-3 font-display font-black text-4xl sm:text-5xl text-gradient-green mb-6">
            КЛУБ
          </h2>
          <p className="text-white/60 text-base leading-relaxed mb-6">
            {aboutText}
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="font-display text-2xl font-bold neon-text-green">24/7</p>
              <p className="text-xs text-white/40 mt-1">Доступ</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="font-display text-2xl font-bold neon-text-cyan">VIP</p>
              <p className="text-xs text-white/40 mt-1">Зона</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="font-display text-2xl font-bold neon-text-green">PRO</p>
              <p className="text-xs text-white/40 mt-1">Столы</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
