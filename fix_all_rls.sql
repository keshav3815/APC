-- ============================================
-- FIX ALL RLS POLICIES
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/szddxrihwwpnhaqmhafu/sql/new
-- ============================================

-- ============================================
-- STEP 1: Create profile trigger function if not exists
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 2: Update the admin user's role
-- ============================================
UPDATE public.profiles SET role = 'admin' WHERE id = '3dc4f7b7-846a-4e19-9ddf-cb30e9959a56';
UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@apc.com';

-- ============================================
-- STEP 3: Fix PROFILES TABLE policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view active profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;

-- Anyone can read profiles (needed for auth context)
CREATE POLICY "Anyone can read profiles"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- ============================================
-- CONTACT INQUIRIES - Allow public inserts
-- ============================================
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_inquiries;
DROP POLICY IF EXISTS "Admin access for contact" ON public.contact_inquiries;

CREATE POLICY "Anyone can submit contact"
    ON public.contact_inquiries FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated can view contact"
    ON public.contact_inquiries FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can manage contact"
    ON public.contact_inquiries FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- VOLUNTEER APPLICATIONS - Allow public inserts
-- ============================================
DROP POLICY IF EXISTS "Anyone can apply volunteer" ON public.volunteer_applications;

CREATE POLICY "Anyone can apply volunteer"
    ON public.volunteer_applications FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated can view applications"
    ON public.volunteer_applications FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- DONATIONS - Allow public inserts
-- ============================================
DROP POLICY IF EXISTS "Users can view own donations" ON public.donations;
DROP POLICY IF EXISTS "Users can create donations" ON public.donations;

CREATE POLICY "Anyone can donate"
    ON public.donations FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone can view donations"
    ON public.donations FOR SELECT
    TO anon, authenticated
    USING (true);

-- ============================================
-- BOOK DONATIONS - Allow public inserts
-- ============================================
DROP POLICY IF EXISTS "Anyone can donate books" ON public.book_donations;

CREATE POLICY "Anyone can donate books"
    ON public.book_donations FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone can view book donations"
    ON public.book_donations FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- EVENT REGISTRATIONS - Allow public inserts
-- ============================================
DROP POLICY IF EXISTS "Users can view own event registrations" ON public.event_registrations;
DROP POLICY IF EXISTS "Users can register for events" ON public.event_registrations;

CREATE POLICY "Anyone can register for events"
    ON public.event_registrations FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone can view registrations"
    ON public.event_registrations FOR SELECT
    TO authenticated
    USING (true);

-- ============================================
-- TESTIMONIALS - Allow public inserts
-- ============================================
DROP POLICY IF EXISTS "Anyone can submit testimonial" ON public.testimonials;

CREATE POLICY "Anyone can submit testimonial"
    ON public.testimonials FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone can view approved testimonials"
    ON public.testimonials FOR SELECT
    TO anon, authenticated
    USING (is_approved = true OR auth.uid() IS NOT NULL);

-- ============================================
-- MEMBERS - Allow public inserts (for join community)
-- ============================================
DROP POLICY IF EXISTS "Public read access for members" ON public.members;
DROP POLICY IF EXISTS "Admin write access for members" ON public.members;

CREATE POLICY "Anyone can view members"
    ON public.members FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Anyone can join as member"
    ON public.members FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Admin can manage members"
    ON public.members FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- PUBLIC READ TABLES (stats, events, campaigns, books, etc)
-- ============================================

-- Stats
DROP POLICY IF EXISTS "Public read access for stats" ON public.stats;
DROP POLICY IF EXISTS "Admin write access for stats" ON public.stats;

CREATE POLICY "Anyone can read stats"
    ON public.stats FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admin can manage stats"
    ON public.stats FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Events
DROP POLICY IF EXISTS "Public read access for events" ON public.events;
DROP POLICY IF EXISTS "Admin write access for events" ON public.events;

CREATE POLICY "Anyone can read events"
    ON public.events FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admin can manage events"
    ON public.events FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Campaigns
DROP POLICY IF EXISTS "Public read access for campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admin write access for campaigns" ON public.campaigns;

CREATE POLICY "Anyone can read campaigns"
    ON public.campaigns FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admin can manage campaigns"
    ON public.campaigns FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Books
DROP POLICY IF EXISTS "Public read access for books" ON public.books;
DROP POLICY IF EXISTS "Librarian write access for books" ON public.books;

CREATE POLICY "Anyone can read books"
    ON public.books FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Staff can manage books"
    ON public.books FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'librarian'))
    );

-- Transactions (for transparency page)
DROP POLICY IF EXISTS "Admin access for transactions" ON public.transactions;

CREATE POLICY "Anyone can read transactions"
    ON public.transactions FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admin can manage transactions"
    ON public.transactions FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Library Patrons
DROP POLICY IF EXISTS "Librarian access for library_patrons" ON public.library_patrons;

CREATE POLICY "Staff can manage patrons"
    ON public.library_patrons FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'librarian'))
    );

-- Book Issues
DROP POLICY IF EXISTS "Librarian access for book_issues" ON public.book_issues;

CREATE POLICY "Staff can manage book issues"
    ON public.book_issues FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'librarian'))
    );

CREATE POLICY "Anyone can read book issues"
    ON public.book_issues FOR SELECT
    TO anon, authenticated
    USING (true);

-- Past Contributors
DROP POLICY IF EXISTS "Anyone can read past contributors" ON public.past_contributors;

CREATE POLICY "Anyone can read past contributors"
    ON public.past_contributors FOR SELECT
    TO anon, authenticated
    USING (true);

-- Hero Content
DROP POLICY IF EXISTS "Public read access for hero_content" ON public.hero_content;
DROP POLICY IF EXISTS "Admin write access for hero_content" ON public.hero_content;

CREATE POLICY "Anyone can read hero content"
    ON public.hero_content FOR SELECT
    TO anon, authenticated
    USING (true);

-- Site Settings
DROP POLICY IF EXISTS "Admin access for site_settings" ON public.site_settings;

CREATE POLICY "Anyone can read site settings"
    ON public.site_settings FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admin can manage site settings"
    ON public.site_settings FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Media
DROP POLICY IF EXISTS "Anyone can read media" ON public.media;

CREATE POLICY "Anyone can read media"
    ON public.media FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admin can manage media"
    ON public.media FOR ALL
    TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Impact Stories
CREATE POLICY "Anyone can read impact stories"
    ON public.impact_stories FOR SELECT
    TO anon, authenticated
    USING (true);

-- ============================================
-- Set the specific user as admin (your user ID)
-- ============================================
UPDATE public.profiles SET role = 'admin' WHERE id = '3dc4f7b7-846a-4e19-9ddf-cb30e9959a56';

SELECT 'RLS policies fixed successfully!' as result;
