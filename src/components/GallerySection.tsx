import { useReveal } from '@/hooks/useReveal';
import { GALLERY_IMAGES } from '@/lib/images';

export function GallerySection() {
  const { ref, revealed } = useReveal();

  return (
    <section id="gallery" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-15" />

      <div ref={ref} className={`relative max-w-7xl mx-auto reveal ${revealed ? 'revealed' : ''}`}>
        <div className="text-center mb-12">
          <span className="font-display text-xs tracking-[0.4em] text-cyan-400/60 uppercase">Атмосфера</span>
          <h2 className="mt-3 font-display font-black text-4xl sm:text-5xl md:text-6xl text-gradient-green">
            ГАЛЕРЕЯ
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {GALLERY_IMAGES.map((img, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-xl group cursor-pointer ${
                idx === 0 || idx === 5 ? 'col-span-2 row-span-2' : ''
              }`}
              style={{
                animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
                animationDelay: `${idx * 60}ms`,
                opacity: 0,
              }}
            >
              <img
                src={img}
                alt={`Gallery ${idx + 1}`}
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                  idx === 0 || idx === 5 ? 'h-full min-h-[300px] sm:min-h-[400px]' : 'h-48 sm:h-56'
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 neon-border-green rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
