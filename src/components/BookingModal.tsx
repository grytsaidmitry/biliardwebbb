import { useState, useEffect } from 'react';
import { X, Send, Loader2, CheckCircle2, AlertCircle, Calendar, Clock, User, Phone } from 'lucide-react';
import type { BilliardTable } from '@/types';
import { formatDateDisplay } from '@/lib/booking';

interface BookingModalProps {
  open: boolean;
  table: BilliardTable | null;
  date: string;
  startTime: string;
  endTime: string;
  telegramBot: string;
  onClose: () => void;
}

export function BookingModal({ open, table, date, startTime, endTime, telegramBot, onClose }: BookingModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setPhone('');
      setSuccess(false);
      setError('');
    }
  }, [open, table]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open || !table) return null;

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      setError('Заполните имя и номер телефона');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({
          tableId: table.id,
          date,
          startTime,
          endTime,
          clientName: name.trim(),
          clientPhone: phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка при создании бронирования');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при создании бронирования');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTelegramRedirect = () => {
    const message = `Здравствуйте! Хочу подтвердить бронирование:\n\nСтол: ${table.name}\nДата: ${formatDateDisplay(date)}\nВремя: ${startTime} — ${endTime}\nИмя: ${name}\nТелефон: ${phone}`;
    const url = `https://t.me/${telegramBot}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className="glass-strong rounded-2xl w-full max-w-md overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="font-display text-xs tracking-[0.3em] text-cyan-400/60 uppercase">Бронирование</span>
          <h2 className="mt-2 font-display font-bold text-xl text-white">
            БРОНИРОВАНИЕ СТОЛА №{table.id}
          </h2>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-full glass neon-border-green flex items-center justify-center mb-4 animate-pulse-glow">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="font-display font-bold text-lg text-white mb-2">Заявка отправлена!</h3>
            <p className="text-sm text-white/50 mb-6">
              Для подтверждения бронирования перейдите в Telegram-бот клуба.
            </p>
            <button
              onClick={handleTelegramRedirect}
              className="btn-neon w-full py-3.5 rounded-lg font-display font-bold text-sm tracking-widest flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              ПРОДОЛЖИТЬ В TELEGRAM
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {/* Booking summary */}
            <div className="glass rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>{formatDateDisplay(date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{startTime} — {endTime}</span>
              </div>
            </div>

            {/* Form fields */}
            <div>
              <label className="flex items-center gap-2 text-xs font-display tracking-wider text-white/50 uppercase mb-2">
                <User className="w-3.5 h-3.5" />
                Имя
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите ваше имя"
                className="input-neon w-full px-4 py-3 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-display tracking-wider text-white/50 uppercase mb-2">
                <Phone className="w-3.5 h-3.5" />
                Номер телефона
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+995 555 123 456"
                className="input-neon w-full px-4 py-3 rounded-lg text-sm"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-neon w-full py-3.5 rounded-lg font-display font-bold text-sm tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  ОБРАБОТКА...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  ПРОДОЛЖИТЬ В TELEGRAM
                </>
              )}
            </button>

            <p className="text-xs text-white/30 text-center">
              Подтверждение бронирования осуществляется через Telegram-бота клуба
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
