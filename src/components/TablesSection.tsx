import { useEffect, useState, useCallback } from 'react';
import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { fetchTables, fetchBookingsForDate, computeAvailability, toISOString } from '@/lib/booking';
import type { BilliardTable, Booking, TableAvailability } from '@/types';
import { TABLE_IMAGES } from '@/lib/images';
import { TableCard } from './TableCard';

interface TablesSectionProps {
  onBookTable: (table: BilliardTable, date: string, startTime: string, endTime: string) => void;
  refreshKey: number;
}

const TIME_SLOTS: string[] = [];
for (let h = 10; h <= 23; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
}
for (let h = 0; h <= 3; h++) {
  TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
}

export function TablesSection({ onBookTable, refreshKey }: TablesSectionProps) {
  const [tables, setTables] = useState<BilliardTable[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => toISOString(new Date()));
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [timeError, setTimeError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [t, b] = await Promise.all([
        fetchTables(),
        fetchBookingsForDate(selectedDate),
      ]);
      setTables(t);
      setBookings(b);
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabaseRealtime();
    return () => {
      channel?.unsubscribe();
    };
  }, [selectedDate]);

  function supabaseRealtime() {
    let ch: ReturnType<typeof import('@/lib/supabase').supabase.channel> | undefined;
    import('@/lib/supabase').then(({ supabase }) => {
      ch = supabase
        .channel('bookings-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
          loadData();
        })
        .subscribe();
    });
    return {
      unsubscribe: () => ch?.unsubscribe(),
    };
  }

  const validateTimes = useCallback(() => {
    const start = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    if (end <= start) {
      setTimeError('Время окончания должно быть позже времени начала');
      return false;
    }
    setTimeError('');
    return true;
  }, [startTime, endTime]);

  useEffect(() => {
    validateTimes();
  }, [validateTimes]);

  const availability: TableAvailability[] = computeAvailability(
    tables,
    bookings,
    selectedDate,
    startTime,
    endTime
  );

  const allBooked = availability.length > 0 && availability.every((a) => !a.isAvailable);

  const minDate = toISOString(new Date());

  return (
    <section id="tables" className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] radial-glow pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-display text-xs tracking-[0.4em] text-cyan-400/60 uppercase">Бронирование</span>
          <h2 className="mt-3 font-display font-black text-4xl sm:text-5xl md:text-6xl text-gradient-green">
            СТОЛЫ
          </h2>
          <p className="mt-4 text-white/40 text-sm tracking-wide max-w-md mx-auto">
            Выберите дату и время — система покажет доступные столы в реальном времени
          </p>
        </div>

        {/* Date & Time Picker */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 mb-8 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-display tracking-wider text-white/50 uppercase mb-2">
                <Calendar className="w-3.5 h-3.5" />
                Дата
              </label>
              <input
                type="date"
                value={selectedDate}
                min={minDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-neon w-full px-4 py-3 rounded-lg text-sm font-medium"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-display tracking-wider text-white/50 uppercase mb-2">
                <Clock className="w-3.5 h-3.5" />
                Начало
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-neon w-full px-4 py-3 rounded-lg text-sm font-medium cursor-pointer"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t} className="bg-card text-white">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-display tracking-wider text-white/50 uppercase mb-2">
                <Clock className="w-3.5 h-3.5" />
                Окончание
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-neon w-full px-4 py-3 rounded-lg text-sm font-medium cursor-pointer"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t} className="bg-card text-white">{t}</option>
                ))}
              </select>
            </div>
          </div>

          {timeError && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {timeError}
            </div>
          )}

          <div className="mt-4 flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1.5"><span className="status-dot free" /> СВОБОДЕН</span>
            <span className="flex items-center gap-1.5"><span className="status-dot booked" /> ЗАНЯТ</span>
            <span className="flex items-center gap-1.5"><span className="status-dot selected" /> ВЫБРАН</span>
          </div>
        </div>

        {/* All booked notice */}
        {allBooked && !loading && !timeError && (
          <div className="glass-card neon-border-red rounded-2xl p-8 text-center mb-8 max-w-2xl mx-auto animate-scale-in">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="font-display font-bold text-2xl text-red-400 mb-2">НА ЭТО ВРЕМЯ ВСЕ СТОЛЫ ЗАНЯТЫ</h3>
            <p className="text-white/50 text-sm mb-6">К сожалению, на выбранное время свободных столов нет. Попробуйте выбрать другое время.</p>
            <button
              onClick={() => {
                document.querySelector('#tables')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-outline px-6 py-3 rounded-lg font-display text-sm tracking-widest"
            >
              ВЫБРАТЬ ДРУГОЕ ВРЕМЯ
            </button>
          </div>
        )}

        {/* Table cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden h-80">
                <div className="skeleton h-40 w-full" />
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 w-24 rounded" />
                  <div className="skeleton h-4 w-16 rounded" />
                  <div className="skeleton h-10 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {availability.map((avail, idx) => (
              <TableCard
                key={avail.table.id}
                availability={avail}
                imageUrl={TABLE_IMAGES[idx % TABLE_IMAGES.length]}
                date={selectedDate}
                startTime={startTime}
                endTime={endTime}
                onBook={() => onBookTable(avail.table, selectedDate, startTime, endTime)}
                delay={idx * 80}
              />
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 text-white/40 mt-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            Загрузка столов...
          </div>
        )}
      </div>
    </section>
  );
}
