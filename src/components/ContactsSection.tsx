import { useReveal } from '@/hooks/useReveal';
import { MapPin, Phone, Clock, Send, ChevronRight, Navigation, ExternalLink } from 'lucide-react';
import type { ClubSettings } from '@/types';
import { IMAGES } from '@/lib/images';

interface ContactsSectionProps {
  settings: ClubSettings | null;
  onBookClick: () => void;
}

export function ContactsSection({ settings, onBookClick }: ContactsSectionProps) {
  const { ref, revealed } = useReveal();

  if (!settings) return null;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    settings.address + ' Batumi Georgia'
  )}`;
  const phoneHref = `tel:${settings.phone.replace(/[\s+]/g, '')}`;
  const telegramUrl = `https://t.me/${settings.telegram_bot_username}`;

  return (
    <section id="contacts" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-15" />

      <div ref={ref} className={`relative max-w-6xl mx-auto reveal ${revealed ? 'revealed' : ''}`}>
        <div className="text-center mb-12">
          <span className="font-display text-xs tracking-[0.4em] text-cyan-400/60 uppercase">Связаться</span>
          <h2 className="mt-3 font-display font-black text-4xl sm:text-5xl md:text-6xl text-gradient-green">
            КОНТАКТЫ
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Info card */}
          <div className="glass-card rounded-2xl p-8 space-y-3">
            {/* Address — opens Google Maps */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 -mx-4 rounded-xl hover:bg-white/5 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl glass neon-border-green flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Адрес</p>
                <p className="text-white/80 text-sm group-hover:text-green-400 transition-colors">
                  {settings.address}
                </p>
              </div>
              <div className="flex items-center gap-1 text-white/30 group-hover:text-green-400 transition-colors">
                <Navigation className="w-4 h-4" />
                <ChevronRight className="w-4 h-4" />
              </div>
            </a>

            <div className="h-px bg-white/5" />

            {/* Phone — initiates a call */}
            <a
              href={phoneHref}
              className="group flex items-center gap-4 p-4 -mx-4 rounded-xl hover:bg-white/5 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl glass neon-border-cyan flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Телефон</p>
                <p className="text-white/80 text-sm group-hover:text-cyan-400 transition-colors">
                  {settings.phone}
                </p>
              </div>
              <div className="flex items-center gap-1 text-white/30 group-hover:text-cyan-400 transition-colors">
                <Phone className="w-4 h-4" />
                <ChevronRight className="w-4 h-4" />
              </div>
            </a>

            <div className="h-px bg-white/5" />

            {/* Telegram — opens bot page */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 -mx-4 rounded-xl hover:bg-white/5 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl glass neon-border-green flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Telegram</p>
                <p className="text-white/80 text-sm group-hover:text-green-400 transition-colors">
                  @{settings.telegram_bot_username}
                </p>
              </div>
              <div className="flex items-center gap-1 text-white/30 group-hover:text-green-400 transition-colors">
                <ExternalLink className="w-4 h-4" />
                <ChevronRight className="w-4 h-4" />
              </div>
            </a>

            <div className="h-px bg-white/5" />

            {/* Hours — static info */}
            <div className="flex items-start gap-4 p-4 -mx-4">
              <div className="w-12 h-12 rounded-xl glass neon-border-cyan flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Часы работы</p>
                <p className="text-white/80 text-sm">Будни: {settings.hours_weekday}</p>
                <p className="text-white/80 text-sm">Выходные: {settings.hours_weekend}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={onBookClick}
                className="btn-neon flex-1 py-3.5 rounded-lg font-display font-bold text-sm tracking-widest"
              >
                ЗАБРОНИРОВАТЬ СТОЛ
              </button>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex-1 py-3.5 rounded-lg font-display font-bold text-sm tracking-widest flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                TELEGRAM
              </a>
            </div>
          </div>

          {/* Map / Image */}
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative rounded-2xl overflow-hidden min-h-[400px] group cursor-pointer"
          >
            <img
              src={IMAGES.batumiSkyline}
              alt="Batumi location"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050807] via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="glass-strong rounded-xl p-4 inline-block">
                <p className="font-display font-bold text-lg text-white">BATUMI</p>
                <p className="text-xs text-white/50 tracking-wider">GEORGIA · BLACK SEA</p>
              </div>
            </div>
            <div className="absolute top-6 right-6 w-12 h-12 rounded-full glass neon-border-green flex items-center justify-center animate-pulse-glow">
              <MapPin className="w-6 h-6 text-green-400" />
            </div>
            <div className="absolute top-6 left-6 glass-strong rounded-lg px-3 py-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Navigation className="w-4 h-4 text-green-400" />
              <span className="text-xs text-white/80 tracking-wide">Открыть на карте</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
