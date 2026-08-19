import { supabase } from './supabase';
import type { Booking, BilliardTable, TableAvailability } from '@/types';

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

export function toISOString(date: Date): string {
  return formatDate(date);
}

export function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = parseTime(start1);
  const e1 = parseTime(end1);
  const s2 = parseTime(start2);
  const e2 = parseTime(end2);
  return s1 < e2 && s2 < e1;
}

export async function fetchTables(): Promise<BilliardTable[]> {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function fetchActiveBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .in('status', ['pending', 'confirmed'])
    .order('booking_date')
    .order('start_time');
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('booking_date', { ascending: false })
    .order('start_time');
  if (error) throw error;
  return data ?? [];
}

export async function fetchBookingsForDate(date: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed'])
    .order('start_time');
  if (error) throw error;
  return data ?? [];
}

export function computeAvailability(
  tables: BilliardTable[],
  bookings: Booking[],
  date: string,
  startTime: string,
  endTime: string
): TableAvailability[] {
  return tables.map((table) => {
    const conflicting = bookings.find(
      (b) =>
        b.table_id === table.id &&
        b.booking_date === date &&
        timesOverlap(startTime, endTime, b.start_time, b.end_time)
    );
    return {
      table,
      isAvailable: !conflicting,
      conflictingBooking: conflicting ?? null,
    };
  });
}

export function isAnyTableAvailable(avail: TableAvailability[]): boolean {
  return avail.some((a) => a.isAvailable);
}

export async function fetchPricing() {
  const { data, error } = await supabase
    .from('pricing')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function fetchSettings() {
  const { data, error } = await supabase
    .from('club_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return data;
}
