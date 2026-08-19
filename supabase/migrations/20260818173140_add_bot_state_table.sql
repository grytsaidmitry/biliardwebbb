/*
# Add bot_state table for Telegram polling offset

1. New Tables
- `bot_state` — key/value store for bot state (e.g., last processed update offset)
2. Security
- Enable RLS. No anon access (only service role uses this).
*/

CREATE TABLE IF NOT EXISTS bot_state (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bot_state ENABLE ROW LEVEL SECURITY;

-- No policies needed — only service role accesses this table.