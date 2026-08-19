import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { tableId, date, startTime, endTime, clientName, clientPhone } = await req.json();

    if (!tableId || !date || !startTime || !endTime || !clientName || !clientPhone) {
      return new Response(
        JSON.stringify({ error: "Все поля обязательны" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate time order
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    if (endMin <= startMin) {
      return new Response(
        JSON.stringify({ error: "Время окончания должно быть позже начала" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for overlapping bookings on the same table and date
    const { data: existing, error: queryError } = await supabase
      .from("bookings")
      .select("*")
      .eq("table_id", tableId)
      .eq("booking_date", date)
      .in("status", ["pending", "confirmed"]);

    if (queryError) throw queryError;

    const hasOverlap = (existing || []).some((b) => {
      const [bsh, bsm] = b.start_time.split(":").map(Number);
      const [beh, bem] = b.end_time.split(":").map(Number);
      const bStart = bsh * 60 + bsm;
      const bEnd = beh * 60 + bem;
      return startMin < bEnd && bStart < endMin;
    });

    if (hasOverlap) {
      return new Response(
        JSON.stringify({ error: "Это время уже занято для данного стола" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the booking (pending status — confirmed via Telegram)
    const { data: booking, error: insertError } = await supabase
      .from("bookings")
      .insert({
        table_id: tableId,
        booking_date: date,
        start_time: startTime,
        end_time: endTime,
        client_name: clientName,
        client_phone: clientPhone,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Notify admin via Telegram if bot is configured
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const adminChatId = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID");
    if (botToken && adminChatId) {
      const message = `🔔 НОВАЯ БРОНЬ (ожидает подтверждения)\n\nСтол: №${tableId}\nДата: ${date.split("-").reverse().join(".")}\nВремя: ${startTime} — ${endTime}\nКлиент: ${clientName}\nТелефон: ${clientPhone}`;
      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: adminChatId, text: message, parse_mode: "HTML" }),
        });
      } catch {
        // Telegram notification is best-effort
      }
    }

    return new Response(
      JSON.stringify({ success: true, booking }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
