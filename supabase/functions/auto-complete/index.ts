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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get current time in Asia/Tbilisi timezone
    const now = new Date();
    const tbilisiTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tbilisi" }));
    const today = tbilisiTime.toISOString().split("T")[0];
    const currentTime = `${String(tbilisiTime.getHours()).padStart(2, "0")}:${String(tbilisiTime.getMinutes()).padStart(2, "0")}`;

    // Find all active bookings where end_time has passed
    const { data: activeBookings, error } = await supabase
      .from("bookings")
      .select("*")
      .in("status", ["pending", "confirmed"])
      .lte("booking_date", today);

    if (error) throw error;

    let completedCount = 0;
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const adminChatId = Deno.env.get("TELEGRAM_ADMIN_CHAT_ID");

    for (const booking of activeBookings || []) {
      // Check if the booking's end time has passed
      const [eh, em] = booking.end_time.split(":").map(Number);
      const bookingEnd = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;

      // If booking date is before today, or booking date is today and end time has passed
      const isPast = booking.booking_date < today || (booking.booking_date === today && currentTime >= bookingEnd);

      if (isPast) {
        const { error: updateError } = await supabase
          .from("bookings")
          .update({ status: "completed" })
          .eq("id", booking.id);

        if (!updateError) {
          completedCount++;
          // Notify admin
          if (botToken && adminChatId) {
            try {
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: adminChatId,
                  text: `✅ Бронь завершена автоматически\n\nСтол №${booking.table_id}\nДата: ${booking.booking_date.split("-").reverse().join(".")}\nВремя: ${booking.start_time}—${booking.end_time}\nКлиент: ${booking.client_name}\n\nСтол снова свободен.`,
                }),
              });
            } catch {
              // best-effort
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, completed: completedCount, checkedAt: now.toISOString(), tbilisiTime: tbilisiTime.toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
