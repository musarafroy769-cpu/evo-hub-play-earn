-- Update the RLS policy to prevent users from changing their game_uid
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND (
    -- Allow update only if game_uid is not being changed
    game_uid IS NOT DISTINCT FROM (SELECT game_uid FROM public.profiles WHERE id = auth.uid())
  )
);