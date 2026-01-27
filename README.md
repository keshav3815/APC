# APC Community Website

A comprehensive community hub website built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 1. Community
- Active Members profiles with photos, roles, and contributions
- Past Contributors section
- Join APC membership form with skills, interests, and availability
- Filters: volunteer, donor, mentor, student
- Member statistics (total members, hours served, cities)

### 2. Books
- Active Users section showing people using APC books
- Book Readers testimonials
- Donate Books form (physical/digital)
- Book categories: School, Competitive exams, Skill, Self-help
- Tracking: books donated, books distributed, impact counter

### 3. Events
- Upcoming Events with date, location, and registration
- Completed Events with gallery, outcomes, and stats
- Event types: workshops, donation drives, seminars
- Calendar view + registration CTA

### 4. Donations
- One-time & monthly donations
- Purpose-based donations (education, food, health)
- Progress bars (₹ raised vs target)
- Impact stories + testimonials
- UPI / Razorpay / Stripe integration (UI ready)

### Additional Pages
- Home (hero + mission + impact stats)
- About APC
- Mission & Vision
- Contact
- Volunteer
- Transparency / Reports

## UI/UX Features

- ✅ Mobile-first responsive design
- ✅ Modern cards and clean typography
- ✅ Soft animations and smooth scroll
- ✅ Dashboard-style counters
- ✅ Dark mode support

## Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── page.tsx              # Home page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── community/            # Community page
│   ├── books/                # Books page
│   ├── events/               # Events page
│   ├── donations/            # Donations page
│   ├── about/                # About page
│   ├── mission/              # Mission & Vision page
│   ├── contact/              # Contact page
│   ├── volunteer/            # Volunteer page
│   └── transparency/         # Transparency page
├── components/
│   ├── Header.tsx            # Navigation header
│   └── Footer.tsx            # Footer component
└── package.json
```

## Technologies Used

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Framer Motion** - Animations (ready for use)

## Customization

- Update colors in `tailwind.config.ts`
- Modify content in respective page files
- Add payment gateway integration in `app/donations/page.tsx`
- Connect forms to backend APIs

## License

This project is created for APC community.
