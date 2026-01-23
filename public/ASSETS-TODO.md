# Assets Needed for Distribuia

Replace the placeholder files with actual branded assets.

## Required Files

### 1. logo.png (or logo.svg)
- **Size:** ~200x40px (or scalable SVG)
- **Use:** Main logo in navigation
- **Current:** Placeholder SVG with text "distribuia"

### 2. logo-icon.png (or logo-icon.svg)
- **Size:** 40x40px
- **Use:** Small icon contexts, mobile nav
- **Current:** Placeholder with "D" on teal background

### 3. og-image.png
- **Size:** 1200x630px (required)
- **Use:** Social media preview when sharing links
- **Suggested content:**
  - Distribuia logo
  - Tagline: "Convierte videos en posts de LinkedIn"
  - Teal/brand color background
  - Clean, professional look

### 4. favicon.ico
- **Size:** Multi-resolution ICO (16x16, 32x32, 48x48)
- **Use:** Browser tab icon
- **How to create:** Use [favicon.io](https://favicon.io/) or [realfavicongenerator.net](https://realfavicongenerator.net/)
- **Source:** Convert from logo-icon.png

### 5. apple-touch-icon.png
- **Size:** 180x180px
- **Use:** iOS home screen when users "Add to Home Screen"
- **Note:** Do NOT add rounded corners - iOS adds them automatically
- **Content:** Logo icon on solid teal background

## Tools for Creating Assets

- **Figma/Canva:** For og-image.png
- **favicon.io:** Convert PNG to favicon.ico
- **Squoosh:** Optimize PNG file sizes

## After Replacing

1. Delete this ASSETS-TODO.md file
2. Rebuild: `npm run build`
3. Deploy: `vercel --prod`
