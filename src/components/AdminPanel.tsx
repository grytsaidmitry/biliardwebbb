import { useState, useEffect, useCallback } from 'react';
import {
  Lock, X, Calendar, Clock, User, Phone, Trash2, Edit3, Plus,
  Loader2, AlertCircle, CheckCircle2, RefreshCw, TableIcon,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { fetchAllBookings, fetchTables, toISOString, formatDateDisplay } from '@/lib/booking';
import type { Booking, BilliardTable, BookingStatus } from '@/types';

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'ОЖИДАЕТ',
  confirmed: 'ПОДТВЕРЖДЕНО',
  completed: 'ЗАВЕРШЕНО',
  cancelled: 'ОТМЕНЕНО',
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'text-yellow-400',
  confirmed: 'text-green-400',
  completed: 'text-white/40',
  cancelled: 'text-red-400',
};

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
  telegramBot: string;
}

export function AdminPanel({ open, onClose, telegramBot }: AdminPanelProps) {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tables, setTables] = useState<BilliardTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manual booking form
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualForm, setManualForm] = useState({
    tableId: 1,
    date: toISOString(new Date()),
    startTime: '18:00',
    endTime: '20:00',
    clientName: '',
    clientPhone: '',
  });

  // Edit booking
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Booking | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [b, t] = await Promise.all([fetchAllBookings(), fetchTables()]);
      setBookings(b);
      setTables(t);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleAuth = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/admin-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Неверный пароль');
      }
      setAuthed(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Ошибка авторизации');
    } finally {
      setAuthLoading(false);
    }
  };

  const callAdminApi = async (action: string, payload: Record<string, unknown>) => {
    setActionLoading(action);
    setActionMessage(null);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/admin-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify({ password, action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      setActionMessage({ type: 'success', text: data.message || 'Готово' });
      await loadData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err instanceof Error ? err.message : 'Ошибка' });
    } finally {
      setActionLoading(null);
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const activeBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="fixed inset-0 z-[100] modal-backdrop flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className="glass-strong rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-5 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg glass neon-border-cyan flex items-center justify-center">
              <TableIcon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">АДМИН-ПАНЕЛЬ</h2>
              <p className="text-xs text-white/40">Управление бронированиями</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!authed ? (
          <div className="p-8 flex-1 flex items-center justify-center">
            <div className="w-full max-w-xs text-center">
              <div className="w-16 h-16 mx-auto rounded-full glass neon-border-cyan flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="font-display font-bold text-lg text-white mb-2">Вход в админ-панель</h3>
              <p className="text-xs text-white/40 mb-6">Введите пароль администратора</p>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                placeholder="Пароль"
                className="input-neon w-full px-4 py-3 rounded-lg text-sm text-center mb-3"
                autoFocus
              />
              {authError && (
                <div className="flex items-center gap-2 text-red-400 text-xs mb-3 justify-center">
                  <AlertCircle className="w-4 h-4" /> {authError}
                </div>
              )}
              <button
                onClick={handleAuth}
                disabled={authLoading}
                className="btn-neon w-full py-3 rounded-lg font-display font-bold text-sm tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
                ВОЙТИ
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Action message */}
            {actionMessage && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                actionMessage.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {actionMessage.text}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadData()}
                  className="btn-outline px-4 py-2 rounded-lg text-xs font-display tracking-wider flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  ОБНОВИТЬ
                </button>
                <button
                  onClick={() => setShowManualForm(!showManualForm)}
                  className="btn-neon px-4 py-2 rounded-lg text-xs font-display tracking-wider flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  СОЗДАТЬ БРОНЬ
                </button>
              </div>
              <a
                href={`https://t.me/${telegramBot}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400/60 hover:text-cyan-400 transition-colors"
              >
                Telegram: @{telegramBot}
              </a>
            </div>

            {/* Manual booking form */}
            {showManualForm && (
              <div className="glass-card rounded-xl p-4 space-y-3 animate-scale-in">
                <h4 className="font-display text-sm font-bold text-white tracking-wide">Новая бронь</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <select
                    value={manualForm.tableId}
                    onChange={(e) => setManualForm({ ...manualForm, tableId: Number(e.target.value) })}
                    className="input-neon px-3 py-2 rounded-lg text-xs"
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.id} className="bg-card text-white">{t.name}</option>
                    ))}
                  </select>
                  <input type="date" value={manualForm.date} onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })} className="input-neon px-3 py-2 rounded-lg text-xs" />
                  <input type="time" value={manualForm.startTime} onChange={(e) => setManualForm({ ...manualForm, startTime: e.target.value })} className="input-neon px-3 py-2 rounded-lg text-xs" />
                  <input type="time" value={manualForm.endTime} onChange={(e) => setManualForm({ ...manualForm, endTime: e.target.value })} className="input-neon px-3 py-2 rounded-lg text-xs" />
                  <input type="text" placeholder="Имя" value={manualForm.clientName} onChange={(e) => setManualForm({ ...manualForm, clientName: e.target.value })} className="input-neon px-3 py-2 rounded-lg text-xs" />
                  <input type="tel" placeholder="Телефон" value={manualForm.clientPhone} onChange={(e) => setManualForm({ ...manualForm, clientPhone: e.target.value })} className="input-neon px-3 py-2 rounded-lg text-xs" />
                </div>
                <button
                  onClick={() => callAdminApi('create_manual', manualForm)}
                  disabled={actionLoading === 'create_manual'}
                  className="btn-neon px-4 py-2 rounded-lg text-xs font-display tracking-wider flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === 'create_manual' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  СОЗДАТЬ
                </button>
              </div>
            )}

            {/* Active bookings */}
            <div>
              <h3 className="font-display text-sm font-bold text-white tracking-wide mb-3 flex items-center gap-2">
                <span className="status-dot free" /> АКТИВНЫЕ БРОНИ ({activeBookings.length})
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-8 text-white/40">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : activeBookings.length === 0 ? (
                <p className="text-white/30 text-sm py-4 text-center">Нет активных броней</p>
              ) : (
                <div className="space-y-2">
                  {activeBookings.map((b) => (
                    <BookingRow
                      key={b.id}
                      booking={b}
                      tables={tables}
                      editing={editingId === b.id}
                      editForm={editForm}
                      onEdit={() => { setEditingId(b.id); setEditForm(b); }}
                      onCancelEdit={() => { setEditingId(null); setEditForm(null); }}
                      onSaveEdit={() => {
                        if (editForm) callAdminApi('update_booking', { bookingId: b.id, ...editForm });
                        setEditingId(null);
                        setEditForm(null);
                      }}
                      onEditChange={setEditForm}
                      onCancel={() => callAdminApi('cancel_booking', { bookingId: b.id })}
                      onComplete={() => callAdminApi('complete_booking', { bookingId: b.id })}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Past bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h3 className="font-display text-sm font-bold text-white/50 tracking-wide mb-3 flex items-center gap-2">
                  <span className="status-dot booked" /> ИСТОРИЯ ({pastBookings.length})
                </h3>
                <div className="space-y-2 opacity-60">
                  {pastBookings.slice(0, 20).map((b) => (
                    <div key={b.id} className="glass rounded-lg p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-display text-white">Стол №{b.table_id}</span>
                        <span className="text-white/50">{formatDateDisplay(b.booking_date)}</span>
                        <span className="text-white/50">{b.start_time}—{b.end_time}</span>
                        <span className="text-white/50">{b.client_name}</span>
                      </div>
                      <span className={`font-display ${STATUS_COLORS[b.status]}`}>{STATUS_LABELS[b.status]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface BookingRowProps {
  booking: Booking;
  tables: BilliardTable[];
  editing: boolean;
  editForm: Booking | null;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditChange: (b: Booking) => void;
  onCancel: () => void;
  onComplete: () => void;
  actionLoading: string | null;
}

function BookingRow({
  booking, tables, editing, editForm, onEdit, onCancelEdit, onSaveEdit, onEditChange, onCancel, onComplete, actionLoading,
}: BookingRowProps) {
  return (
    <div className="glass-card rounded-xl p-3">
      {editing && editForm ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <select
              value={editForm.table_id}
              onChange={(e) => onEditChange({ ...editForm, table_id: Number(e.target.value) })}
              className="input-neon px-2 py-1.5 rounded text-xs"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id} className="bg-card text-white">{t.name}</option>
              ))}
            </select>
            <input type="date" value={editForm.booking_date} onChange={(e) => onEditChange({ ...editForm, booking_date: e.target.value })} className="input-neon px-2 py-1.5 rounded text-xs" />
            <input type="time" value={editForm.start_time} onChange={(e) => onEditChange({ ...editForm, start_time: e.target.value })} className="input-neon px-2 py-1.5 rounded text-xs" />
            <input type="time" value={editForm.end_time} onChange={(e) => onEditChange({ ...editForm, end_time: e.target.value })} className="input-neon px-2 py-1.5 rounded text-xs" />
            <input type="text" value={editForm.client_name} onChange={(e) => onEditChange({ ...editForm, client_name: e.target.value })} className="input-neon px-2 py-1.5 rounded text-xs" />
            <input type="tel" value={editForm.client_phone} onChange={(e) => onEditChange({ ...editForm, client_phone: e.target.value })} className="input-neon px-2 py-1.5 rounded text-xs" />
          </div>
          <div className="flex gap-2">
            <button onClick={onSaveEdit} className="btn-neon px-3 py-1.5 rounded text-xs font-display tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> СОХРАНИТЬ
            </button>
            <button onClick={onCancelEdit} className="btn-outline px-3 py-1.5 rounded text-xs font-display tracking-wider">ОТМЕНА</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-display text-white font-bold">Стол №{booking.table_id}</span>
            <span className="flex items-center gap-1 text-white/60"><Calendar className="w-3 h-3" />{formatDateDisplay(booking.booking_date)}</span>
            <span className="flex items-center gap-1 text-white/60"><Clock className="w-3 h-3" />{booking.start_time}—{booking.end_time}</span>
            <span className="flex items-center gap-1 text-white/60"><User className="w-3 h-3" />{booking.client_name}</span>
            <span className="flex items-center gap-1 text-white/60"><Phone className="w-3 h-3" />{booking.client_phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-display text-xs ${STATUS_COLORS[booking.status]}`}>{STATUS_LABELS[booking.status]}</span>
            <button onClick={onEdit} className="p-1.5 text-white/40 hover:text-cyan-400 transition-colors" title="Редактировать">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            {booking.status === 'confirmed' && (
              <button onClick={onComplete} disabled={actionLoading === `complete_booking`} className="p-1.5 text-white/40 hover:text-green-400 transition-colors" title="Завершить">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button onClick={onCancel} disabled={actionLoading === 'cancel_booking'} className="p-1.5 text-white/40 hover:text-red-400 transition-colors" title="Отменить">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
