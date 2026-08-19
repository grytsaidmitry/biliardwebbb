import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const BOT_TOKEN = Deno.env.get("8856853552:AAHhGiD8f6iKRYPV0NGLBkB8QSAEvHqSbCs");
const ADMIN_CHAT_ID = Deno.env.get("1056831179");

// Track which update offset we've processed
const LAST_OFFSET_KEY = "telegram_offset";

async function getOffset(): Promise<number> {
  const { data } = await supabase
    .from("club_settings")
    .select("telegram_bot_username")
    .eq("id", 1)
    .maybeSingle();
  // Use a simple approach: store offset in a settings-like table
  // For now, use Supabase to store the offset
  const { data: offsetData } = await supabase
    .from("bot_state")
    .select("value")
    .eq("key", LAST_OFFSET_KEY)
    .maybeSingle();
  return offsetData?.value ? Number(offsetData.value) : 0;
}

async function setOffset(offset: number): Promise<void> {
  await supabase
    .from("bot_state")
    .upsert({ key: LAST_OFFSET_KEY, value: offset });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // This function handles both webhook and manual polling
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode") || "webhook";

  if (mode === "poll") {
    return handlePoll();
  }

  // Webhook mode: process the update from Telegram
  try {
    const update = await req.json();
    await processUpdate(update);
    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handlePoll() {
  if (!BOT_TOKEN) {
    return new Response(
      JSON.stringify({ error: "TELEGRAM_BOT_TOKEN not configured" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const offset = await getOffset();
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=0`
    );
    const data = await res.json();

    if (!data.ok) {
      return new Response(
        JSON.stringify({ error: "Telegram API error" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const updates = data.result || [];
    for (const update of updates) {
      await processUpdate(update);
      await setOffset(update.update_id + 1);
    }

    return new Response(
      JSON.stringify({ ok: true, processed: updates.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

async function processUpdate(update: any) {
  if (!BOT_TOKEN) return;

  const msg = update.message || update.callback_query?.message;
  const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id;
  const text = update.message?.text || "";
  const callbackData = update.callback_query?.data;

  if (!chatId) return;

  // Admin commands
  if (ADMIN_CHAT_ID && String(chatId) === String(ADMIN_CHAT_ID)) {
    if (text === "/start" || text === "/admin" || text === "/manage") {
      await sendAdminPanel(chatId);
      return;
    }

    if (text === "/status") {
      await sendStatusReport(chatId);
      return;
    }

    // Handle callback queries for admin
    if (callbackData) {
      await handleAdminCallback(update.callback_query);
      return;
    }
  }

  // Regular user messages
  if (text === "/start") {
    await sendMessage(
      chatId,
      "🎱 Добро пожаловать в NEON BILLIARD CLUB!\n\nБатуми · Грузия\n\nЗдесь вы можете подтвердить ваше бронирование.\n\nДля бронирования стола посетите наш сайт.",
      { inline_keyboard: [[{ text: "🌐 Открыть сайт", url: "https://bolt.new" }]] }
    );
    return;
  }

  // Default: echo back as potential booking confirmation
  await sendMessage(
    chatId,
    "Для бронирования стола, пожалуйста, используйте наш сайт. После отправки заявки вы получите инструкции по подтверждению здесь.",
    { inline_keyboard: [[{ text: "🌐 Открыть сайт", url: "https://bolt.new" }]] }
  );
}

async function sendAdminPanel(chatId: number) {
  const { data: tables } = await supabase.from("tables").select("*").order("sort_order");
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .in("status", ["pending", "confirmed"])
    .order("booking_date")
    .order("start_time");

  let text = "🎱 УПРАВЛЕНИЕ СТОЛАМИ\n\n";
  const keyboard: any[][] = [];

  for (const table of tables || []) {
    const tableBookings = (bookings || []).filter((b) => b.table_id === table.id);
    const isBooked = tableBookings.length > 0;
    const status = isBooked ? "🔴 ЗАНЯТ" : "🟢 СВОБОДЕН";
    text += `Стол №${table.id} — ${status}`;
    if (isBooked) {
      const b = tableBookings[0];
      text += `\n  📅 ${b.booking_date} ${b.start_time}—${b.end_time}\n  👤 ${b.client_name} ${b.client_phone}`;
    }
    text += "\n\n";

    if (isBooked) {
      keyboard.push([{ text: `Освободить стол №${table.id}`, callback_data: `free_${table.id}` }]);
    } else {
      keyboard.push([{ text: `Заблокировать стол №${table.id}`, callback_data: `block_${table.id}` }]);
    }
  }

  keyboard.push([{ text: "📊 Обновить статус", callback_data: "refresh" }]);

  await sendMessage(chatId, text, { inline_keyboard: keyboard });
}

async function sendStatusReport(chatId: number) {
  const { data: tables } = await supabase.from("tables").select("*").order("sort_order");
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .in("status", ["pending", "confirmed"])
    .order("booking_date");

  const today = new Date().toISOString().split("T")[0];
  const todayBookings = (bookings || []).filter((b) => b.booking_date === today);

  let text = `📊 СТАТУС КЛУБА\n\n`;
  text += `Дата: ${today.split("-").reverse().join(".")}\n`;
  text += `Активных броней: ${(bookings || []).length}\n`;
  text += `Сегодня: ${todayBookings.length}\n\n`;

  for (const table of tables || []) {
    const tableBookings = (bookings || []).filter((b) => b.table_id === table.id);
    const isBooked = tableBookings.length > 0;
    text += `Стол №${table.id}: ${isBooked ? "🔴" : "🟢"} ${isBooked ? "ЗАНЯТ" : "СВОБОДЕН"}\n`;
  }

  await sendMessage(chatId, text);
}

async function handleAdminCallback(callbackQuery: any) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  // Answer the callback query
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQuery.id }),
  });

  if (data === "refresh") {
    await sendAdminPanel(chatId);
    return;
  }

  if (data.startsWith("free_")) {
    const tableId = data.replace("free_", "");
    // Complete all active bookings for this table
    await supabase
      .from("bookings")
      .update({ status: "completed" })
      .eq("table_id", tableId)
      .in("status", ["pending", "confirmed"]);
    await sendMessage(chatId, `✅ Стол №${tableId} освобожден`);
    await sendAdminPanel(chatId);
    return;
  }

  if (data.startsWith("block_")) {
    const tableId = data.replace("block_", "");
    const today = new Date().toISOString().split("T")[0];
    await supabase.from("bookings").insert({
      table_id: Number(tableId),
      booking_date: today,
      start_time: "00:00",
      end_time: "23:59",
      client_name: "ADMIN BLOCK",
      client_phone: "-",
      status: "confirmed",
    });
    await sendMessage(chatId, `🔴 Стол №${tableId} заблокирован`);
    await sendAdminPanel(chatId);
    return;
  }
}

async function sendMessage(chatId: number, text: string, extra: any = {}) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, ...extra }),
  });
}
