import { useEffect, useState } from 'react';
import { useReveal } from '@/hooks/useReveal';
import { fetchPricing } from '@/lib/booking';
import type { Pricing } from '@/types';
import { IMAGES } from '@/lib/images';

const TIER_IMAGES: Record<string, string> = {
  weekday: IMAGES.iconWeekday,
  weekend: IMAGES.iconWeekend,
  vip: IMAGES.iconVip,
};

const TIER_DESCRIPTIONS: Record<string, string> = {
  weekday: 'Пн — Чт',
  weekend: 'Пт — Вс',
  vip: 'VIP стол · Премиум',
};

export function PricingSection() {
  const { ref, revealed } = useReveal();
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricing()
      .then(setPricing)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="pricing" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] radial-glow pointer-events-none" />

      <div ref={ref} className={`relative max-w-5xl mx-auto reveal ${revealed ? 'revealed' : ''}`}>
        <div className="text-center mb-12">
          <span className="font-display text-xs tracking-[0.4em] text-cyan-400/60 uppercase">Тарифы</span>
          <h2 className="mt-3 font-display font-black text-4xl sm:text-5xl md:text-6xl text-gradient-green">
            ЦЕНЫ
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 h-64">
                <div className="skeleton h-8 w-20 rounded mb-4" />
                <div className="skeleton h-12 w-32 rounded mb-4" />
                <div className="skeleton h-4 w-24 rounded" />
              </div>
            ))
          ) : (
            pricing.map((tier, idx) => (
              <div
                key={tier.id}
                className={`glass-card rounded-2xl p-8 transition-all duration-500 hover:scale-[1.03] ${
                  tier.tier_key === 'vip' ? 'neon-border-cyan' : 'hover:neon-border-green'
                }`}
                style={{
                  animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
                  animationDelay: `${idx * 100}ms`,
                  opacity: 0,
                }}
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden mb-4 border border-white/10">
                  <img src={TIER_IMAGES[tier.tier_key] || IMAGES.iconBall} alt={tier.tier_name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-display font-bold text-xl text-white tracking-wide mb-2">
                  {tier.tier_name}
                </h3>
                <p className="text-xs text-white/40 mb-6 tracking-wide">
                  {TIER_DESCRIPTIONS[tier.tier_key] || ''}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-white/40">от</span>
                  <span className="font-display font-black text-4xl text-gradient">
                    {tier.price_per_hour}
                  </span>
                  <span className="text-sm text-white/40">₽/час</span>
                </div>
                {tier.tier_key === 'vip' && (
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <p className="text-xs text-cyan-400/60 tracking-wide">
                      Премиальный стол · Эксклюзивная зона
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
