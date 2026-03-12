
-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'event_reminder_1d', 'event_reminder_10m', 'new_comment', 'new_reply'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  reference_id TEXT, -- event_id or post_id
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow service role inserts (for triggers/functions)
CREATE POLICY "Service role insert notifications"
  ON public.notifications FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger function: notify on new comment
CREATE OR REPLACE FUNCTION public.notify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_title TEXT;
  v_post_user_id UUID;
  v_parent_user_id UUID;
  v_commenter_name TEXT;
BEGIN
  -- Get commenter name
  SELECT COALESCE(full_name, 'Usuário') INTO v_commenter_name
  FROM public.profiles WHERE id = NEW.user_id;

  IF NEW.parent_id IS NULL THEN
    -- Top-level comment: notify post creator
    SELECT title, user_id INTO v_post_title, v_post_user_id
    FROM public.posts WHERE id = NEW.post_id;

    IF v_post_user_id IS NOT NULL AND v_post_user_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, title, body, reference_id)
      VALUES (
        v_post_user_id,
        'new_comment',
        'Novo comentário na sua discussão',
        v_commenter_name || ' comentou em "' || LEFT(v_post_title, 50) || '"',
        NEW.post_id
      );
    END IF;
  ELSE
    -- Reply: notify parent comment author
    SELECT user_id INTO v_parent_user_id
    FROM public.comments WHERE id = NEW.parent_id;

    SELECT title INTO v_post_title
    FROM public.posts WHERE id = NEW.post_id;

    IF v_parent_user_id IS NOT NULL AND v_parent_user_id != NEW.user_id THEN
      INSERT INTO public.notifications (user_id, type, title, body, reference_id)
      VALUES (
        v_parent_user_id,
        'new_reply',
        'Nova resposta ao seu comentário',
        v_commenter_name || ' respondeu seu comentário em "' || LEFT(v_post_title, 50) || '"',
        NEW.post_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_comment();
