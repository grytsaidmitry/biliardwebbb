import { Crown } from 'lucide-react';
import type { TableAvailability } from '@/types';

interface TableCardProps {
  availability: TableAvailability;
  imageUrl: string;
  date: string;
  startTime: string;
  endTime: string;
  onBook: () => void;
  delay: number;
}

export function TableCard({ availability, imageUrl, date, startTime, endTime, onBook, delay }: TableCardProps) {
  const { table, isAvailable, conflictingBooking } = availability;

  return (
    <div
      className={`glass-card rounded-2xl overflow-hidden group transition-all duration-500 hover:scale-[1.02] ${
        isAvailable ? 'hover:neon-border-green' : 'hover:neon-border-red'
      }`}
      style={{
        animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        animationDelay: `${delay}ms`,
        opacity: 0,
      }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={imageUrl}
          alt={table.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1311] via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full glass-strong text-xs font-display font-bold tracking-wider ${
              isAvailable ? 'neon-text-green' : 'neon-text-red'
            }`}
          >
            <span className={`status-dot ${isAvailable ? 'free' : 'booked'}`} />
            {isAvailable ? 'FREE' : 'BOOKED'}
          </div>
        </div>

        {/* VIP badge */}
        {table.is_vip && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-strong text-xs font-display font-bold tracking-wider neon-text-cyan">
            <Crown className="w-3.5 h-3.5" />
            VIP
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-bold text-lg text-white tracking-wide">
            {table.name}
          </h3>
        </div>

        <p className="text-xs text-white/40 mb-1">
          {date.split('-').reverse().join('.')} · {startTime} — {endTime}
        </p>

        {conflictingBooking && (
          <p className="text-xs text-red-400/60 mb-3">
            Занят: {conflictingBooking.start_time} — {conflictingBooking.end_time}
          </p>
        )}

        {!conflictingBooking && <div className="h-5" />}

        <button
          onClick={onBook}
          disabled={!isAvailable}
          className={`w-full py-3 rounded-lg font-display font-bold text-sm tracking-widest transition-all duration-300 ${
            isAvailable
              ? 'btn-neon'
              : 'bg-white/5 border border-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          {isAvailable ? 'ЗАБРОНИРОВАТЬ' : 'ЗАНЯТ'}
        </button>
      </div>
    </div>
  );
}
