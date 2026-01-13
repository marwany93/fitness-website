# Fitness & Wellness Website 🏋️‍♂️🥗

A modern, bilingual (Arabic/English) fitness website featuring workout classes, healthy meal plans, and educational content about fitness and nutrition.

## Features

- 🌐 **Bilingual Support**: Seamlessly switch between Arabic (RTL) and English (LTR)
- 💪 **Workout Classes**: Free video content and subscription-based programs
- 🥗 **Healthy Meals**: Recipe library with videos and detailed instructions
- 📚 **Educational Content**: Science-backed fitness and nutrition information
- 📱 **Fully Responsive**: Optimized for mobile, tablet, and desktop
- 🎨 **Modern Design**: Clean, professional interface with smooth animations

## Project Structure

```
.
├── index.html              # Home page
├── packages.html           # Subscription packages
├── classes.html            # Workout classes
├── meals.html              # Healthy meals
├── science.html            # Educational content
├── css/
│   ├── main.css           # Main stylesheet
│   └── bilingual.css      # Bilingual support styles
├── js/
│   ├── main.js            # Core functionality
│   └── bilingual.js       # Language switching
└── assets/
    └── images/            # Images and media
```

## Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd Antigravity
```

2. Open with a local server (recommended):
```bash
# Using Python 3
python -m http.server 8000

# Using PHP
php -S localhost:8000

# Or use VS Code Live Server extension
```

3. Visit `http://localhost:8000` in your browser

## Deployment to GitHub Pages

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to Pages section
   - Select `main` branch as source
   - Save and wait for deployment

3. Your site will be live at: `https://<username>.github.io/<repository-name>/`

## Content Management

### Updating Language Content
Edit the translation objects in `js/bilingual.js` to update text content for both languages.

### Adding New Pages
1. Create new HTML file following the structure of existing pages
2. Add navigation links in all page headers
3. Update language files with new page content

### Video Integration
Replace placeholder video URLs in the HTML files with your actual video hosting URLs:
- YouTube: Use embed links
- Vimeo: Use player embed codes
- Or host videos on cloud storage with direct links

## Payment Integration (Future)

Currently using contact-based subscription. To add payment:
1. Set up Paymob account (supports InstaPay & Vodafone Cash)
2. Integrate payment API (requires backend - consider Netlify/Vercel Functions)
3. Update package page with payment forms

## Contributing

Feel free to submit issues and enhancement requests!

## License

All rights reserved.
