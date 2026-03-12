
-- Remove overly permissive insert policy and replace with user_id scoped one
DROP POLICY "Service can insert notifications" ON public.notifications;

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
