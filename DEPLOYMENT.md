# Deployment Guide

## Quick Start

### Option 1: Python Server (Recommended for Testing)
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000 in your browser.

### Option 2: Node.js http-server
```bash
npx http-server -p 8000
```

### Option 3: PHP Built-in Server
```bash
php -S localhost:8000
```

## Installing as PWA

1. Open the app in Google Chrome
2. Look for the install icon in the address bar
3. Click "Install" or use Menu → "Install Quran Memory Game"
4. The app will be installed to your device and can run offline!

## Production Deployment

### Deploy to GitHub Pages

1. Push your code to GitHub
2. Go to Settings → Pages
3. Select main/master branch as source
4. Your app will be available at: `https://yourusername.github.io/quran-memorization/`

### Deploy to Netlify

1. Sign up at [netlify.com](https://netlify.com)
2. Drag and drop your project folder
3. Your app will be live instantly with a custom URL!

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Your app will be deployed with automatic HTTPS!

## Browser Compatibility

| Browser | Support | PWA Install |
|---------|---------|-------------|
| Chrome  | ✅ Full  | ✅ Yes      |
| Edge    | ✅ Full  | ✅ Yes      |
| Firefox | ✅ Full  | ⚠️ Limited  |
| Safari  | ✅ Full  | ⚠️ Limited  |

## Features Testing Checklist

- [ ] Main menu loads with colorful design
- [ ] All three game modes are accessible
- [ ] Continue Ayat game works correctly
- [ ] Puzzle Ayat drag-and-drop functions
- [ ] Guess Ayat shows translations and options
- [ ] Surah selector displays all Surahs
- [ ] Multiplayer room creation/joining works
- [ ] Score tracking persists across sessions
- [ ] Service worker caches resources
- [ ] App works offline after first visit
- [ ] PWA can be installed from Chrome
- [ ] Responsive design on mobile devices

## Troubleshooting

### API Not Loading
The app has fallback data built-in. If the API at https://quran-api.santrikoding.com is unavailable, the app will use Al-Fatihah (Surah 1) with complete verses.

### PWA Not Installing
- Make sure you're using HTTPS (or localhost for development)
- Check that manifest.json is being served correctly
- Ensure service worker is registered (check Console)

### Icons Not Showing
The icon files are SVG-based placeholders. For production, replace with actual PNG files:
- icon-192.png (192x192 pixels)
- icon-512.png (512x512 pixels)

## Performance Tips

1. **Enable Caching**: The service worker automatically caches resources
2. **API Caching**: API responses are cached in localStorage
3. **Lazy Loading**: Surah data is loaded on-demand
4. **Minimize Reflows**: CSS uses hardware-accelerated transforms

## Local Network Multiplayer

To play multiplayer on local network:

1. Host device runs the server: `python3 -m http.server 8000`
2. Find host IP address: `ip addr` or `ifconfig`
3. Other players navigate to: `http://[HOST_IP]:8000`
4. Host creates a room, players join with room name
5. Start the game!

## Security Notes

- No user data is collected or transmitted
- All game data stored locally in browser
- API calls are read-only (GET requests)
- Service worker only caches public resources

## Future Enhancements

Possible additions for future versions:
- Real-time multiplayer with WebRTC
- More game modes (memory matching, speed typing)
- Difficulty levels
- Achievements and badges
- Leaderboards
- Audio recitation integration
- Dark mode theme
- Multiple language support

## Support

For issues or questions:
- Create an issue on GitHub
- Check the README for documentation
- Test in Chrome for best compatibility

---

**Made with ❤️ for learning Quran**
