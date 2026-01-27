# Logo Setup Guide

## Logo Files Required

Place these files in the `/public/images/` directory:

### 1. Main Logo
- **File**: `logo.png`
- **Size**: 200x200px minimum (recommended: 512x512px)
- **Format**: PNG with transparent background
- **Usage**: Header, navigation, and general branding

### 2. Favicon Variants
- **favicon.ico** (32x32px) - Browser tab icon
- **apple-touch-icon.png** (180x180px) - Apple devices homescreen icon
- **android-chrome-192x192.png** (192x192px) - Android homescreen
- **android-chrome-512x512.png** (512x512px) - Android splash screen

## Creating Logo with Transparent Background

### Option 1: Online Tools (Easiest)
1. Go to [Remove.bg](https://remove.bg)
2. Upload your logo image
3. Download the PNG with transparent background
4. Save as `logo.png`

### Option 2: ImageMagick (Command Line)
```bash
convert logo-original.jpg -transparent white logo.png
```

### Option 3: GIMP (Free Desktop App)
1. Open your logo image
2. Layer → Transparency → Add Alpha Channel
3. Use "Select by Color" tool to select the background
4. Delete the background
5. File → Export As → logo.png

## Using the Logo Component

### In Header (Already Implemented)
The header automatically uses the logo from `/public/images/logo.png`

### In Other Components
```tsx
import Logo from '@/components/Logo'

// Small logo without text
<Logo size="sm" />

// Medium logo with text
<Logo size="md" showText />

// Large logo linking to home
<Logo size="lg" href="/" />

// Custom className
<Logo size="md" className="shadow-lg" />
```

## Logo Sizes

- **sm**: 40x40px (favicons, small badges)
- **md**: 50x50px (headers, default)
- **lg**: 80x80px (hero sections, prominent placement)
- **xl**: 120x120px (landing pages, large headers)

## CSS Classes Available

- `.logo-container` - Main wrapper with hover effects
- `.logo-image` - Image styling with drop shadow
- `.logo-float` - Adds floating animation on hover
- `.logo-sm`, `.logo-md`, `.logo-lg` - Size variants

## Next Steps

1. Remove background from your APC logo image
2. Save as PNG with transparency
3. Generate favicon variants (use favicon generator like [favicon-generator.org](https://www.favicon-generator.org))
4. Place all files in `/public/images/`
5. The logo will automatically appear in the header and wherever you use the Logo component

---

**Note**: All logo files should have transparent backgrounds for best results across different page backgrounds.
