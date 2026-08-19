export interface BilliardTable {
  id: number;
  name: string;
  image_url: string | null;
  is_vip: boolean;
  sort_order: number;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  table_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  client_name: string;
  client_phone: string;
  status: BookingStatus;
  telegram_chat_id: number | null;
  telegram_message_id: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Pricing {
  id: number;
  tier_key: string;
  tier_name: string;
  price_per_hour: number;
  sort_order: number;
}

export interface ClubSettings {
  id: number;
  club_name: string;
  tagline: string;
  subtitle: string;
  telegram_bot_username: string;
  address: string;
  phone: string;
  hours_weekday: string;
  hours_weekend: string;
  map_embed_url: string;
  about_text: string;
  updated_at: string;
}

export interface TableAvailability {
  table: BilliardTable;
  isAvailable: boolean;
  conflictingBooking: Booking | null;
}
