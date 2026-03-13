import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getZoomAccessToken(): Promise<string> {
  const accountId = Deno.env.get("ZOOM_ACCOUNT_ID")!;
  const clientId = Deno.env.get("ZOOM_CLIENT_ID")!;
  const clientSecret = Deno.env.get("ZOOM_CLIENT_SECRET")!;

  const credentials = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to get Zoom token: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function createZoomMeeting(
  accessToken: string,
  topic: string,
  startTime: string,
  duration: number
) {
  const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      topic,
      type: 2,
      start_time: startTime,
      duration,
      timezone: "UTC",
      settings: {
        join_before_host: true,
        waiting_room: false,
        auto_recording: "none",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create Zoom meeting: ${err}`);
  }

  return await res.json();
}

function generateOccurrences(
  startTime: string,
  endTime: string,
  recurrence: string | undefined
): Array<{ start: Date; end: Date }> {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const durationMs = end.getTime() - start.getTime();

  if (!recurrence || recurrence === "none") {
    return [{ start, end }];
  }

  const occurrences: Array<{ start: Date; end: Date }> = [];
  const maxCount = recurrence === "daily" ? 15 : 4;
  const intervalMs = recurrence === "daily" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

  for (let i = 0; i < maxCount; i++) {
    const occStart = new Date(start.getTime() + i * intervalMs);
    const occEnd = new Date(occStart.getTime() + durationMs);
    occurrences.push({ start: occStart, end: occEnd });
  }

  return occurrences;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, description, start_time, end_time, recurrence } = await req.json();

    if (!title || !start_time || !end_time) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: title, start_time, end_time" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate start_time is not in the past
    if (new Date(start_time) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Start time cannot be in the past" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate recurrence
    if (recurrence && !["daily", "weekly"].includes(recurrence)) {
      return new Response(
        JSON.stringify({ error: "Invalid recurrence type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const occurrences = generateOccurrences(start_time, end_time, recurrence);
    const accessToken = await getZoomAccessToken();
    const createdEvents = [];

    for (let i = 0; i < occurrences.length; i++) {
      const occ = occurrences[i];
      const durationMinutes = Math.max(
        30,
        Math.round((occ.end.getTime() - occ.start.getTime()) / 60000)
      );

      const occTitle = occurrences.length > 1 ? `${title} (${i + 1}/${occurrences.length})` : title;

      console.log(`Creating Zoom meeting ${i + 1}/${occurrences.length}:`, {
        title: occTitle,
        start_time: occ.start.toISOString(),
        duration: durationMinutes,
      });

      const meeting = await createZoomMeeting(
        accessToken,
        occTitle,
        occ.start.toISOString(),
        durationMinutes
      );

      console.log("Zoom meeting created:", meeting.id);

      const { data: event, error: insertError } = await supabase
        .from("events")
        .insert({
          title: occTitle,
          description: description || null,
          zoom_link: meeting.join_url,
          start_time: occ.start.toISOString(),
          end_time: occ.end.toISOString(),
          user_id: user.id,
        })
        .select()
        .single();

      if (insertError) {
        console.error("DB insert error:", insertError.message);
        return new Response(
          JSON.stringify({ error: "Failed to save event: " + insertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Event saved:", event.id);
      createdEvents.push({ event, zoom_join_url: meeting.join_url, zoom_start_url: meeting.start_url });
    }

    return new Response(
      JSON.stringify({
        events: createdEvents,
        events_created: createdEvents.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Function error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
