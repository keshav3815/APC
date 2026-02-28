-- Fix donations RLS to allow anonymous donations
-- This allows anyone (authenticated or not) to create donations

-- Drop all existing policies for donations
DROP POLICY IF EXISTS "Users can create donations" ON public.donations;
DROP POLICY IF EXISTS "Anyone can create donations" ON public.donations;
DROP POLICY IF EXISTS "Users can view donations" ON public.donations;
DROP POLICY IF EXISTS "Anyone can view donations" ON public.donations;

-- Create new policies that allow both authenticated and anonymous users
CREATE POLICY "Anyone can create donations"
    ON public.donations FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can view donations"
    ON public.donations FOR SELECT
    USING (true);
