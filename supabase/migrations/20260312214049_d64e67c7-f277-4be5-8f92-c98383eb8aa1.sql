
-- Create event_participants table
CREATE TABLE public.event_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- All authenticated users can see participants
CREATE POLICY "Participants viewable by authenticated"
  ON public.event_participants FOR SELECT
  TO authenticated USING (true);

-- Users can join events (insert their own participation)
CREATE POLICY "Users can join events"
  ON public.event_participants FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can leave events (delete their own participation)
CREATE POLICY "Users can leave events"
  ON public.event_participants FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_participants;
