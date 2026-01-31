-- ============================================
-- APC Production Database Schema
-- Supabase Migration File
-- Version: 1.0.0
-- ============================================

-- Enable necessary extensions (in extensions schema for Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- ============================================
-- ENUM Types
-- ============================================

CREATE TYPE user_role AS ENUM ('admin', 'user', 'librarian');
CREATE TYPE member_type AS ENUM ('volunteer', 'donor', 'mentor', 'student');
CREATE TYPE book_status AS ENUM ('available', 'borrowed', 'reserved', 'lost', 'damaged');
CREATE TYPE book_category AS ENUM ('school', 'competitive', 'skill', 'self-help', 'other');
CREATE TYPE event_type AS ENUM ('workshop', 'donation-drive', 'seminar', 'meetup', 'other');
CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE donation_purpose AS ENUM ('education', 'food', 'health', 'general');
CREATE TYPE donation_type AS ENUM ('one-time', 'monthly', 'annual');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- ============================================
-- Users & Authentication
-- ============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    village TEXT,
    city TEXT,
    state TEXT,
    bio TEXT,
    skills TEXT[],
    interests TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Site Settings & Configuration
-- ============================================

-- General site settings (key-value store)
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero section content
CREATE TABLE public.hero_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    cta_primary_text TEXT,
    cta_primary_link TEXT,
    cta_secondary_text TEXT,
    cta_secondary_link TEXT,
    background_image TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Statistics/counters displayed on homepage
CREATE TABLE public.stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    value INTEGER DEFAULT 0,
    icon TEXT,
    color TEXT,
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Community Members
-- ============================================

CREATE TABLE public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    photo_url TEXT,
    role TEXT NOT NULL,
    member_type member_type DEFAULT 'volunteer',
    contribution TEXT,
    village TEXT,
    skills TEXT[],
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Past contributors/alumni
CREATE TABLE public.past_contributors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    years TEXT,
    contribution TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Library Management System
-- ============================================

-- Books catalog
CREATE TABLE public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    accession_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    publisher TEXT,
    publication_year INTEGER,
    category book_category DEFAULT 'other',
    description TEXT,
    cover_image TEXT,
    status book_status DEFAULT 'available',
    condition TEXT,
    location TEXT,
    donor_id UUID REFERENCES public.profiles(id),
    donor_name TEXT,
    added_by UUID REFERENCES public.profiles(id),
    total_copies INTEGER DEFAULT 1,
    available_copies INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Library patrons (members who can borrow books)
CREATE TABLE public.library_patrons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patron_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    max_books_allowed INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    membership_start TIMESTAMPTZ DEFAULT NOW(),
    membership_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Book issuance/borrowing records
CREATE TABLE public.book_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    patron_id UUID NOT NULL REFERENCES public.library_patrons(id) ON DELETE CASCADE,
    issued_by UUID REFERENCES public.profiles(id),
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    return_date TIMESTAMPTZ,
    returned_by UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'issued',
    fine_amount DECIMAL(10,2) DEFAULT 0,
    fine_paid BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Book reservations
CREATE TABLE public.book_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    patron_id UUID NOT NULL REFERENCES public.library_patrons(id) ON DELETE CASCADE,
    reserved_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Book donations tracking
CREATE TABLE public.book_donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_name TEXT NOT NULL,
    donor_email TEXT,
    donor_phone TEXT,
    book_title TEXT NOT NULL,
    author TEXT,
    category book_category,
    book_type TEXT DEFAULT 'physical',
    condition TEXT,
    quantity INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending',
    received_by UUID REFERENCES public.profiles(id),
    received_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Events Management
-- ============================================

CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    event_type event_type DEFAULT 'other',
    status event_status DEFAULT 'upcoming',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location TEXT,
    venue_address TEXT,
    is_online BOOLEAN DEFAULT false,
    online_link TEXT,
    cover_image TEXT,
    capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    organizer_id UUID REFERENCES public.profiles(id),
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event registrations
CREATE TABLE public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'registered',
    attended BOOLEAN DEFAULT false,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, email)
);

-- Completed event outcomes
CREATE TABLE public.event_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    outcome TEXT,
    stats TEXT,
    attendees_count INTEGER,
    feedback_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event gallery
CREATE TABLE public.event_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Donations & Campaigns
-- ============================================

-- Donation campaigns
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    purpose donation_purpose DEFAULT 'general',
    target_amount DECIMAL(12,2) NOT NULL,
    raised_amount DECIMAL(12,2) DEFAULT 0,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    cover_image TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual donations
CREATE TABLE public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    donor_name TEXT NOT NULL,
    donor_email TEXT,
    donor_phone TEXT,
    amount DECIMAL(12,2) NOT NULL,
    donation_type donation_type DEFAULT 'one-time',
    purpose donation_purpose DEFAULT 'general',
    payment_method TEXT,
    payment_status payment_status DEFAULT 'pending',
    transaction_id TEXT,
    is_anonymous BOOLEAN DEFAULT false,
    message TEXT,
    receipt_sent BOOLEAN DEFAULT false,
    donated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Impact stories
CREATE TABLE public.impact_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    story TEXT NOT NULL,
    category donation_purpose,
    beneficiary_name TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Financial Transparency
-- ============================================

-- Financial transactions (income/expense)
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type transaction_type NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    transaction_date DATE NOT NULL,
    reference_id TEXT,
    receipt_url TEXT,
    added_by UUID REFERENCES public.profiles(id),
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial reports
CREATE TABLE public.financial_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    report_period TEXT,
    total_income DECIMAL(12,2),
    total_expense DECIMAL(12,2),
    balance DECIMAL(12,2),
    report_url TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Testimonials & Reviews
-- ============================================

CREATE TABLE public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    role TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    photo_url TEXT,
    category TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Contact & Inquiries
-- ============================================

CREATE TABLE public.contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    responded_by UUID REFERENCES public.profiles(id),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Volunteer Applications
-- ============================================

CREATE TABLE public.volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    city TEXT,
    skills TEXT,
    interests TEXT,
    availability TEXT,
    experience TEXT,
    status TEXT DEFAULT 'pending',
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Activity Logs / Audit Trail
-- ============================================

CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Notifications
-- ============================================

CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info',
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Media/File Management
-- ============================================

CREATE TABLE public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    original_name TEXT,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    mime_type TEXT,
    file_size INTEGER,
    uploaded_by UUID REFERENCES public.profiles(id),
    folder TEXT DEFAULT 'general',
    alt_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.past_contributors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_patrons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impact_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies - Profiles
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- RLS Policies - Public Read Access
-- ============================================

-- Public tables (read-only for all, write for admin)
CREATE POLICY "Public read access for hero_content"
    ON public.hero_content FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

CREATE POLICY "Admin write access for hero_content"
    ON public.hero_content FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Public read access for stats"
    ON public.stats FOR SELECT
    TO anon, authenticated
    USING (is_visible = true);

CREATE POLICY "Admin write access for stats"
    ON public.stats FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Public read access for members"
    ON public.members FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

CREATE POLICY "Admin write access for members"
    ON public.members FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Public read access for events"
    ON public.events FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

CREATE POLICY "Admin write access for events"
    ON public.events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Public read access for campaigns"
    ON public.campaigns FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

CREATE POLICY "Admin write access for campaigns"
    ON public.campaigns FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- RLS Policies - Books & Library
-- ============================================

CREATE POLICY "Public read access for books"
    ON public.books FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Librarian write access for books"
    ON public.books FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'librarian')
        )
    );

CREATE POLICY "Librarian access for library_patrons"
    ON public.library_patrons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'librarian')
        )
    );

CREATE POLICY "Librarian access for book_issues"
    ON public.book_issues FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'librarian')
        )
    );

-- ============================================
-- RLS Policies - User-specific data
-- ============================================

CREATE POLICY "Users can view own donations"
    ON public.donations FOR SELECT
    USING (auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can create donations"
    ON public.donations FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view own event registrations"
    ON public.event_registrations FOR SELECT
    USING (auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can register for events"
    ON public.event_registrations FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- RLS Policies - Admin Only
-- ============================================

CREATE POLICY "Admin access for site_settings"
    ON public.site_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin access for transactions"
    ON public.transactions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admin access for activity_logs"
    ON public.activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================
-- Functions
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update book availability
CREATE OR REPLACE FUNCTION public.update_book_availability()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.books
        SET available_copies = available_copies - 1,
            status = CASE WHEN available_copies - 1 = 0 THEN 'borrowed'::book_status ELSE status END
        WHERE id = NEW.book_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.return_date IS NOT NULL AND OLD.return_date IS NULL THEN
        UPDATE public.books
        SET available_copies = available_copies + 1,
            status = 'available'::book_status
        WHERE id = NEW.book_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_book_issue
    AFTER INSERT OR UPDATE ON public.book_issues
    FOR EACH ROW EXECUTE FUNCTION public.update_book_availability();

-- Function to update campaign raised amount
CREATE OR REPLACE FUNCTION public.update_campaign_amount()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.campaign_id IS NOT NULL AND NEW.payment_status = 'completed' THEN
        UPDATE public.campaigns
        SET raised_amount = raised_amount + NEW.amount
        WHERE id = NEW.campaign_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_donation_complete
    AFTER INSERT OR UPDATE ON public.donations
    FOR EACH ROW EXECUTE FUNCTION public.update_campaign_amount();

-- Function to update event registration count
CREATE OR REPLACE FUNCTION public.update_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.events
        SET registered_count = registered_count + 1
        WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.events
        SET registered_count = registered_count - 1
        WHERE id = OLD.event_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_event_registration
    AFTER INSERT OR DELETE ON public.event_registrations
    FOR EACH ROW EXECUTE FUNCTION public.update_event_registration_count();

-- Function to log activities
CREATE OR REPLACE FUNCTION public.log_activity(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.activity_logs (user_id, action, entity_type, entity_id, details)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details)
    RETURNING id INTO v_log_id;
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_books_status ON public.books(status);
CREATE INDEX idx_books_category ON public.books(category);
CREATE INDEX idx_books_accession ON public.books(accession_number);
CREATE INDEX idx_book_issues_status ON public.book_issues(status);
CREATE INDEX idx_book_issues_patron ON public.book_issues(patron_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_date ON public.events(start_date);
CREATE INDEX idx_donations_user ON public.donations(user_id);
CREATE INDEX idx_donations_campaign ON public.donations(campaign_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at);

-- ============================================
-- Seed Data
-- ============================================

-- Insert default stats
INSERT INTO public.stats (key, label, value, icon, color, display_order) VALUES
    ('members', 'Active Members', 1500, 'Users', 'blue', 1),
    ('books', 'Books in Library', 500, 'BookOpen', 'green', 2),
    ('events', 'Events Organized', 50, 'Calendar', 'purple', 3),
    ('donations', 'Fund Raised (₹)', 50000, 'Heart', 'pink', 4);

-- Insert default hero content
INSERT INTO public.hero_content (title, subtitle, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link) VALUES
    ('Building a Stronger Community Together', 'Empowering lives through education, connection, and collaboration. Join thousands transforming their future.', 'Join Community', '/community', 'Support Us', '/donations');

-- Insert default site settings
INSERT INTO public.site_settings (key, value, description) VALUES
    ('site_name', '"APC - Community Hub"', 'Website name'),
    ('site_description', '"Join APC community - Books, Events, Donations, and More"', 'Website description'),
    ('contact_email', '"contact@apc.org"', 'Contact email'),
    ('contact_phone', '"+91 1234567890"', 'Contact phone'),
    ('social_facebook', '"https://www.facebook.com/apcbheja"', 'Facebook URL'),
    ('social_instagram', '"https://www.instagram.com/apcbheja/"', 'Instagram URL'),
    ('library_fine_per_day', '5', 'Library fine per day in rupees'),
    ('library_max_days', '14', 'Maximum days for book borrowing');

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth';
COMMENT ON TABLE public.books IS 'Library book catalog';
COMMENT ON TABLE public.book_issues IS 'Book borrowing records';
COMMENT ON TABLE public.events IS 'Community events';
COMMENT ON TABLE public.donations IS 'Donation records';
COMMENT ON TABLE public.campaigns IS 'Fundraising campaigns';

-- ============================================
-- Seed Users (for testing)
-- Note: In Supabase, users must be created through auth first
-- These are placeholder entries - actual users should be created via signup
-- Run these SQL commands in Supabase SQL Editor after creating auth users
-- ============================================

-- Instructions for creating test users:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Create users with the following emails:
--    - admin@apc.com (password: Admin@123)
--    - user@apc.com (password: User@123)
--    - library@apc.com (password: Library@123)
-- 3. After creating, run the following to set roles:

-- UPDATE profiles SET role = 'admin', full_name = 'APC Admin' WHERE email = 'admin@apc.com';
-- UPDATE profiles SET role = 'user', full_name = 'APC User' WHERE email = 'user@apc.com';
-- UPDATE profiles SET role = 'librarian', full_name = 'APC Librarian' WHERE email = 'library@apc.com';

-- Or use this function to auto-create profiles with roles:
CREATE OR REPLACE FUNCTION public.set_user_role(p_email TEXT, p_role user_role, p_name TEXT)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles 
    SET role = p_role, full_name = p_name 
    WHERE email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample books
INSERT INTO public.books (accession_number, title, author, isbn, publisher, category, status, total_copies, available_copies) VALUES
    ('APC001', 'NCERT Mathematics Class 10', 'NCERT', '978-81-7450-123-4', 'NCERT', 'school', 'available', 5, 5),
    ('APC002', 'NCERT Science Class 10', 'NCERT', '978-81-7450-124-1', 'NCERT', 'school', 'available', 5, 5),
    ('APC003', 'Quantitative Aptitude', 'R.S. Aggarwal', '978-93-5261-123-4', 'S. Chand', 'competitive', 'available', 3, 3),
    ('APC004', 'Verbal Reasoning', 'R.S. Aggarwal', '978-93-5261-124-1', 'S. Chand', 'competitive', 'available', 3, 3),
    ('APC005', 'Web Development Basics', 'Jon Duckett', '978-1-118-00818-8', 'Wiley', 'skill', 'available', 2, 2),
    ('APC006', 'Python Programming', 'Mark Lutz', '978-1-449-35573-9', 'O''Reilly', 'skill', 'available', 2, 2),
    ('APC007', 'The 7 Habits of Highly Effective People', 'Stephen Covey', '978-1-4767-4000-0', 'Simon & Schuster', 'self-help', 'available', 4, 4),
    ('APC008', 'Think and Grow Rich', 'Napoleon Hill', '978-1-58542-433-7', 'TarcherPerigee', 'self-help', 'available', 3, 3);

-- Insert sample events
INSERT INTO public.events (title, description, event_type, status, start_date, end_date, location, capacity, is_online) VALUES
    ('Web Development Workshop', 'Learn modern web development technologies including HTML, CSS, JavaScript and React', 'workshop', 'upcoming', NOW() + INTERVAL '15 days', NOW() + INTERVAL '15 days' + INTERVAL '4 hours', 'APC Community Center, Mumbai', 50, false),
    ('Book Donation Drive', 'Collect books for underprivileged students. Bring your old books and help someone learn.', 'donation-drive', 'upcoming', NOW() + INTERVAL '20 days', NOW() + INTERVAL '20 days' + INTERVAL '6 hours', 'Multiple Locations', 200, false),
    ('Career Guidance Seminar', 'Expert advice on career planning for students and young professionals', 'seminar', 'upcoming', NOW() + INTERVAL '25 days', NOW() + INTERVAL '25 days' + INTERVAL '3 hours', 'Virtual Event', 100, true);

-- Insert sample campaigns
INSERT INTO public.campaigns (title, description, purpose, target_amount, raised_amount, start_date, end_date, is_active) VALUES
    ('Education for All', 'Support underprivileged students with books and educational materials. Build 10 libraries in rural areas.', 'education', 50000, 25000, NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', true),
    ('Community Food Support', 'Provide nutritious meals and food security to families in need during emergencies.', 'food', 40000, 18000, NOW() - INTERVAL '20 days', NOW() + INTERVAL '70 days', true),
    ('Health & Wellness Initiative', 'Medical camps, health checkups, and assistance for low-income families in rural areas.', 'health', 35000, 12538, NOW() - INTERVAL '15 days', NOW() + INTERVAL '75 days', true);

-- Insert sample library patrons
INSERT INTO public.library_patrons (patron_id, name, email, phone, membership_start, max_books_allowed, is_active) VALUES
    ('APCLIB/08', 'Keshav Kumar Mandal', 'keshav@example.com', '+91 9876543001', NOW() - INTERVAL '60 days', 5, true),
    ('APCLIB/09', 'Jyoti Kumari', 'jyoti@example.com', '+91 9876543002', NOW() - INTERVAL '60 days', 5, true),
    ('APCLIB/10', 'Saraswati Kumari', 'saraswati@example.com', '+91 9876543003', NOW() - INTERVAL '60 days', 5, true),
    ('APCLIB/11', 'Babita Kumari', 'babita@example.com', '+91 9876543004', NOW() - INTERVAL '30 days', 3, true),
    ('APCLIB/12', 'Ganga Kumari', 'ganga@example.com', '+91 9876543005', NOW() - INTERVAL '30 days', 5, true);

-- Insert sample testimonials
INSERT INTO public.testimonials (name, role, content, rating, is_featured, is_approved, category) VALUES
    ('Priya Sharma', 'Student', 'APC books helped me prepare for my competitive exams. The collection is amazing!', 5, true, true, 'library'),
    ('Amit Kumar', 'Community Member', 'I found the perfect self-help books here. Thank you APC for making knowledge accessible.', 5, true, true, 'library'),
    ('Sneha Reddy', 'Professional', 'The skill development books have been a game-changer for my career growth.', 5, true, true, 'education'),
    ('Rahul Mehta', 'Engineering Student', 'Thanks to APC donations, I was able to complete my engineering degree. The scholarship and books made all the difference.', 5, true, true, 'donation');

-- Insert sample members
INSERT INTO public.members (name, email, member_type, role, contribution, village, is_active) VALUES
    ('Ashish Kr Singh', 'ashish@example.com', 'donor', 'Major Donor', 'Financial support for education programs', 'Delhi', true),
    ('Prem Shanker Jha', 'prem@example.com', 'donor', 'Regular Donor', 'Monthly donations for food programs', 'Mumbai', true),
    ('Shiv Kr Singh', 'shiv@example.com', 'volunteer', 'Event Coordinator', 'Organizing community events', 'Madhepur', true),
    ('Vivek Kr Raut', 'vivek@example.com', 'mentor', 'Career Mentor', 'Career guidance for students', 'Darbhanga', true);
