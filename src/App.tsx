import { useState, useEffect, useCallback } from 'react';
import { Settings, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { TablesSection } from '@/components/TablesSection';
import { AboutSection } from '@/components/AboutSection';
import { GallerySection } from '@/components/GallerySection';
import { PricingSection } from '@/components/PricingSection';
import { ContactsSection } from '@/components/ContactsSection';
import { Footer } from '@/components/Footer';
import { BookingModal } from '@/components/BookingModal';
import { AdminPanel } from '@/components/AdminPanel';
import { fetchSettings } from '@/lib/booking';
import type { BilliardTable, ClubSettings } from '@/types';

function App() {
  const [settings, setSettings] = useState<ClubSettings | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<BilliardTable | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingStart, setBookingStart] = useState('18:00');
  const [bookingEnd, setBookingEnd] = useState('20:00');
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSettings = useCallback(async () => {
    try {
      const s = await fetchSettings();
      if (s) setSettings(s);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleBookTable = (table: BilliardTable, date: string, startTime: string, endTime: string) => {
    setSelectedTable(table);
    setBookingDate(date);
    setBookingStart(startTime);
    setBookingEnd(endTime);
    setBookingModalOpen(true);
  };

  const handleBookClick = () => {
    // Scroll to tables section for selection
    document.querySelector('#tables')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTablesClick = () => {
    document.querySelector('#tables')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBookingClose = () => {
    setBookingModalOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const clubName = settings?.club_name ?? 'NEON BILLIARD';
  const telegramBot = settings?.telegram_bot_username ?? 'NeonBilliardBot';

  return (
    <div className="min-h-screen bg-[#050807] text-white relative">
      <Navbar clubName={clubName} telegramBot={telegramBot} onBookClick={handleBookClick} />

      <Hero
        clubName={clubName}
        tagline={settings?.tagline ?? 'БИЛЬЯРД. НОВАЯ ЭРА.'}
        subtitle={settings?.subtitle ?? 'Играй. Бронируй. Побеждай.'}
        onBookClick={handleBookClick}
        onTablesClick={handleTablesClick}
      />

      <TablesSection onBookTable={handleBookTable} refreshKey={refreshKey} />

      <AboutSection aboutText={settings?.about_text ?? ''} />

      <PricingSection />

      <GallerySection />

      <ContactsSection settings={settings} onBookClick={handleBookClick} />

      <Footer clubName={clubName} telegramBot={telegramBot} />

      {/* Admin button (subtle, bottom-left) */}
      <button
        onClick={() => setAdminOpen(true)}
        className="fixed bottom-4 left-4 z-40 w-10 h-10 rounded-lg glass border border-white/5 flex items-center justify-center text-white/20 hover:text-cyan-400 hover:neon-border-cyan transition-all duration-300"
        title="Админ-панель"
        aria-label="Admin"
      >
        <Settings className="w-4 h-4" />
      </button>

      <BookingModal
        open={bookingModalOpen}
        table={selectedTable}
        date={bookingDate}
        startTime={bookingStart}
        endTime={bookingEnd}
        telegramBot={telegramBot}
        onClose={handleBookingClose}
      />

      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} telegramBot={telegramBot} />
    </div>
  );
}

export default App;
