-- ============================================
-- Site Content CMS + FAQs + Computed financial views
-- Migration 005
-- ============================================

-- Site content: CMS-managed text blocks for about, mission, etc.
CREATE TABLE IF NOT EXISTS public.site_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page TEXT NOT NULL,          -- e.g. 'about', 'mission', 'home'
    section TEXT NOT NULL,       -- e.g. 'hero', 'story', 'mission_text', 'vision_text'
    title TEXT,
    body TEXT,                   -- main text/HTML content
    metadata JSONB DEFAULT '{}', -- extra structured data (icon, color, order, etc.)
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    updated_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page, section)
);

-- FAQs table
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page TEXT DEFAULT 'general',  -- which page this FAQ belongs to
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Everyone can read site content
CREATE POLICY "Anyone can read site_content" ON public.site_content
    FOR SELECT USING (true);

-- Only admins can modify site content
CREATE POLICY "Admins can manage site_content" ON public.site_content
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Everyone can read FAQs
CREATE POLICY "Anyone can read faqs" ON public.faqs
    FOR SELECT USING (true);

-- Only admins can modify FAQs
CREATE POLICY "Admins can manage faqs" ON public.faqs
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- Seed default content so pages work immediately
-- ============================================

-- About page content
INSERT INTO public.site_content (page, section, title, body, display_order) VALUES
('about', 'story', 'Our Story', 'APC (Association for Progressive Community) is a non-profit organization dedicated to empowering communities through education, collaboration, and social impact. Founded with a vision to create positive change, we work tirelessly to bridge gaps and create opportunities for all.

Our organization brings together volunteers, donors, mentors, and students from across the country to work towards common goals. Through our various programs including book sharing, educational events, and community initiatives, we have touched thousands of lives.

We believe in transparency, accountability, and the power of collective action. Every donation, every volunteer hour, and every book shared contributes to building a stronger, more educated, and more connected community.', 1),
('about', 'value_community', 'Our Community', 'Working together to create impact across multiple cities in India.', 1),
('about', 'value_goals', 'Our Goals', 'To make education accessible, foster community connections, and create measurable social impact.', 2),
('about', 'value_recognition', 'Recognition', 'Recognized for excellence in community service and educational initiatives by various organizations.', 3),
('about', 'value_values', 'Our Values', 'Integrity, transparency, inclusivity, and commitment to creating lasting positive change.', 4)
ON CONFLICT (page, section) DO NOTHING;

-- Mission page content
INSERT INTO public.site_content (page, section, title, body, display_order) VALUES
('mission', 'mission_text', 'Our Mission', 'To empower communities through accessible education, foster meaningful connections, and create opportunities for growth and development. We strive to bridge the gap between resources and those who need them, ensuring that knowledge, books, and support reach every corner of our society.

Through collaborative efforts, we aim to build a network of engaged citizens who work together to address social challenges, support educational initiatives, and create a more equitable and informed society.', 1),
('mission', 'vision_text', 'Our Vision', 'To become a leading force in community development, where every individual has access to quality education, resources, and opportunities. We envision a future where communities are self-sustaining, well-informed, and actively working towards collective progress.

Our vision extends beyond immediate impact—we aim to create a legacy of empowered communities that continue to grow, learn, and support each other for generations to come.', 2),
('mission', 'value_innovation', 'Innovation', 'We embrace creative solutions and innovative approaches to address community challenges.', 1),
('mission', 'value_compassion', 'Compassion', 'We approach our work with empathy and a genuine desire to help others succeed.', 2),
('mission', 'value_accountability', 'Accountability', 'We maintain transparency and take responsibility for our actions and their impact.', 3),
('mission', 'value_inclusivity', 'Inclusivity', 'We welcome and value diverse perspectives, backgrounds, and contributions.', 4)
ON CONFLICT (page, section) DO NOTHING;

-- Home page mission cards
INSERT INTO public.site_content (page, section, title, body, display_order) VALUES
('home', 'mission_education', 'Education First', 'Providing access to quality books and learning resources that inspire growth and knowledge sharing.', 1),
('home', 'mission_community', 'Strong Communities', 'Building meaningful connections and networks that create lasting impact and support.', 2),
('home', 'mission_impact', 'Real Impact', 'Creating measurable change that transforms lives and strengthens entire communities.', 3)
ON CONFLICT (page, section) DO NOTHING;

-- Volunteer page "Why Volunteer" cards
INSERT INTO public.site_content (page, section, title, body, display_order) VALUES
('volunteer', 'why_impact', 'Make Impact', 'Contribute to meaningful causes and see real change', 1),
('volunteer', 'why_community', 'Build Community', 'Connect with like-minded individuals and expand your network', 2),
('volunteer', 'why_skills', 'Grow Skills', 'Develop new skills and gain valuable experience', 3)
ON CONFLICT (page, section) DO NOTHING;

-- Transparency page commitment cards
INSERT INTO public.site_content (page, section, title, body, display_order) VALUES
('transparency', 'commit_audits', 'Regular Audits', 'All financial records are audited quarterly by independent auditors to ensure accuracy and compliance.', 1),
('transparency', 'commit_reports', 'Public Reports', 'Detailed financial reports are published annually and are available to all stakeholders and the public.', 2),
('transparency', 'commit_accountability', 'Donor Accountability', 'Every donation is tracked and donors can see exactly how their contribution makes a difference.', 3)
ON CONFLICT (page, section) DO NOTHING;

-- Transparency FAQs
INSERT INTO public.faqs (page, question, answer, display_order) VALUES
('transparency', 'How much of my donation goes to programs?', 'We allocate approximately 70-80% of all donations directly to our programs and initiatives. The remaining amount covers essential administrative and operational costs.', 1),
('transparency', 'Can I see detailed breakdowns of where my money goes?', 'Yes! Every donation is tracked and categorized. You can view our Expense Report page for a detailed breakdown of all transactions, or contact us directly for donor-specific information.', 2),
('transparency', 'Are your financial statements audited?', 'Yes, all our financial statements are audited quarterly by independent auditors to ensure complete transparency and compliance with regulations.', 3),
('transparency', 'How can I request additional financial information?', 'You can contact us via our Contact page or email with specific questions about our finances. We are committed to being as transparent as possible.', 4);

-- Add social_links to site_settings if not there
INSERT INTO public.site_content (page, section, title, body, metadata, display_order) VALUES
('contact', 'social_facebook', 'Facebook', 'https://www.facebook.com/apcbheja', '{}', 1),
('contact', 'social_instagram', 'Instagram', 'https://www.instagram.com/apcbheja/', '{}', 2)
ON CONFLICT (page, section) DO NOTHING;
