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
    const body = await req.json();
    const { password, action, ...params } = body;

    // Verify admin password
    const adminPassword = Deno.env.get("gia2026admin");
    if (!adminPassword || password !== adminPassword) {
      return new Response(
        JSON.stringify({ error: "Не авторизован" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let result: { message: string };

    switch (action) {
      case "cancel_booking": {
        const { bookingId } = params;
        const { error } = await supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", bookingId);
        if (error) throw error;
        result = { message: "Бронирование отменено" };
        break;
      }

      case "complete_booking": {
        const { bookingId } = params;
        const { error } = await supabase
          .from("bookings")
          .update({ status: "completed" })
          .eq("id", bookingId);
        if (error) throw error;
        result = { message: "Бронирование завершено" };
        break;
      }

      case "update_booking": {
        const { bookingId, table_id, booking_date, start_time, end_time, client_name, client_phone } = params;
        // Check overlap for the new time
        const { data: existing } = await supabase
          .from("bookings")
          .select("*")
          .eq("table_id", table_id)
          .eq("booking_date", booking_date)
          .neq("id", bookingId)
          .in("status", ["pending", "confirmed"]);

        const [sh, sm] = start_time.split(":").map(Number);
        const [eh, em] = end_time.split(":").map(Number);
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;

        const overlap = (existing || []).some((b) => {
          const [bsh, bsm] = b.start_time.split(":").map(Number);
          const [beh, bem] = b.end_time.split(":").map(Number);
          return startMin < (beh * 60 + bem) && (bsh * 60 + bsm) < endMin;
        });

        if (overlap) {
          return new Response(
            JSON.stringify({ error: "Время пересекается с другой бронью" }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("bookings")
          .update({ table_id, booking_date, start_time, end_time, client_name, client_phone })
          .eq("id", bookingId);
        if (error) throw error;
        result = { message: "Бронирование обновлено" };
        break;
      }

      case "create_manual": {
        const { tableId, date, startTime, endTime, clientName, clientPhone } = params;
        // Check overlap
        const { data: existing } = await supabase
          .from("bookings")
          .select("*")
          .eq("table_id", tableId)
          .eq("booking_date", date)
          .in("status", ["pending", "confirmed"]);

        const [sh, sm] = startTime.split(":").map(Number);
        const [eh, em] = endTime.split(":").map(Number);
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;

        const overlap = (existing || []).some((b) => {
          const [bsh, bsm] = b.start_time.split(":").map(Number);
          const [beh, bem] = b.end_time.split(":").map(Number);
          return startMin < (beh * 60 + bem) && (bsh * 60 + bsm) < endMin;
        });

        if (overlap) {
          return new Response(
            JSON.stringify({ error: "Время пересекается с существующей бронью" }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error } = await supabase
          .from("bookings")
          .insert({
            table_id: tableId,
            booking_date: date,
            start_time: startTime,
            end_time: endTime,
            client_name: clientName,
            client_phone: clientPhone,
            status: "confirmed",
          });
        if (error) throw error;
        result = { message: "Бронирование создано" };
        break;
      }

      case "block_table": {
        const { tableId, date, startTime, endTime } = params;
        const { error } = await supabase
          .from("bookings")
          .insert({
            table_id: tableId,
            booking_date: date,
            start_time: startTime,
            end_time: endTime,
            client_name: "ADMIN BLOCK",
            client_phone: "-",
            status: "confirmed",
          });
        if (error) throw error;
        result = { message: "Стол заблокирован" };
        break;
      }

      case "update_pricing": {
        const { pricingId, pricePerHour } = params;
        const { error } = await supabase
          .from("pricing")
          .update({ price_per_hour: pricePerHour })
          .eq("id", pricingId);
        if (error) throw error;
        result = { message: "Цена обновлена" };
        break;
      }

      case "update_settings": {
        const { settings } = params;
        const { error } = await supabase
          .from("club_settings")
          .update(settings)
          .eq("id", 1);
        if (error) throw error;
        result = { message: "Настройки обновлены" };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Неизвестное действие" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
