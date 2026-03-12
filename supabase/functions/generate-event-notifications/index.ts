import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const now = new Date();
  console.log("Running event notifications check at", now.toISOString());

  // 1-day reminder: events starting between 23h50m and 24h10m from now
  const dayStart = new Date(now.getTime() + 23 * 60 * 60 * 1000 + 50 * 60 * 1000);
  const dayEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 1000);

  // 10-min reminder: events starting between 8m and 12m from now
  const minStart = new Date(now.getTime() + 8 * 60 * 1000);
  const minEnd = new Date(now.getTime() + 12 * 60 * 1000);

  const results: string[] = [];

  // Process each window
  for (const window of [
    { start: dayStart, end: dayEnd, type: "event_reminder_1d", label: "amanhã" },
    { start: minStart, end: minEnd, type: "event_reminder_10m", label: "em 10 minutos" },
  ]) {
    const { data: events, error } = await supabase
      .from("events")
      .select("id, title, user_id, start_time")
      .gte("start_time", window.start.toISOString())
      .lte("start_time", window.end.toISOString());

    if (error || !events?.length) continue;

    for (const event of events) {
      // Check if notification already exists
      const { data: existing } = await supabase
        .from("notifications")
        .select("id")
        .eq("reference_id", event.id)
        .eq("type", window.type)
        .eq("user_id", event.user_id)
        .limit(1);

      if (existing && existing.length > 0) continue;

      // Get participants
      const { data: participants } = await supabase
        .from("event_participants")
        .select("user_id")
        .eq("event_id", event.id);

      const allUsers = new Set<string>();
      allUsers.add(event.user_id);
      if (participants) {
        for (const p of participants) allUsers.add(p.user_id);
      }

      const notifications = [];
      for (const uid of allUsers) {
        // Check if already notified
        const { data: ex } = await supabase
          .from("notifications")
          .select("id")
          .eq("reference_id", event.id)
          .eq("type", window.type)
          .eq("user_id", uid)
          .limit(1);

        if (ex && ex.length > 0) continue;

        const isOrganizer = uid === event.user_id;
        notifications.push({
          user_id: uid,
          type: window.type,
          title: isOrganizer
            ? `Seu evento começa ${window.label}`
            : `Um evento começa ${window.label}`,
          body: isOrganizer
            ? `O evento "${event.title}" que você organizou começa ${window.label}.`
            : `O evento "${event.title}" que você participa começa ${window.label}.`,
          reference_id: event.id,
        });
      }

      if (notifications.length > 0) {
        await supabase.from("notifications").insert(notifications);
        results.push(`${window.type}: ${event.title} → ${notifications.length} notifications`);
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
