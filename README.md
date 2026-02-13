# 🌟 Quran Memorization Game

A fun and interactive web application designed to help kids memorize Quran verses through engaging games!

## 🎮 Features

### Game Modes
- **Continue Ayat**: Complete the verse by choosing the correct continuation
- **Puzzle Ayat**: Arrange scrambled words to form the correct verse
- **Guess Ayat**: Match the translation to the correct Arabic verse

### Key Features
- 🎨 **Kid-Friendly Design**: Colorful, animated interface with fun emojis
- 📱 **Progressive Web App (PWA)**: Can be installed on any device via Chrome
- 👥 **Multiplayer Mode**: Play with friends on the same network
- ⚡ **Optimized Performance**: Caching, lazy loading, and offline support
- 📖 **Complete Quran Data**: Access all 114 Surahs from the API
- 💾 **Offline Support**: Service worker caches data for offline play
- 🏆 **Score Tracking**: Keep track of scores and games played

## 🚀 Getting Started

### Installation

1. Clone this repository:
```bash
git clone https://github.com/AfifRana/quran-memorization.git
cd quran-memorization
```

2. Serve the files using any web server:

**Using Python:**
```bash
python3 -m http.server 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

### Install as PWA

1. Open the app in Chrome
2. Click the install button in the address bar (or go to Menu → Install App)
3. The app will be installed and can be launched like a native app!

## 📡 API Integration

The app uses the Quran API from [santrikoding.com](https://quran-api.santrikoding.com):

- **Base URL**: `https://quran-api.santrikoding.com/api`
- **Endpoints**:
  - `GET /surah` - Get list of all Surahs
  - `GET /surah/{number}` - Get specific Surah details with all Ayats

## 🎯 How to Play

### Single Player Mode
1. Click "Play Game" on the main menu
2. Select your preferred game mode
3. Choose a Surah (or use the default Al-Fatihah)
4. Start playing and earn points!

### Multiplayer Mode
1. Click "Multiplayer" on the main menu
2. **To Host**: Enter a room name and click "Create Room"
3. **To Join**: Enter the room name and click "Join Room"
4. Once all players have joined, start the game!

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Structure and semantics
- **CSS3**: Styling with gradients, animations, and responsive design
- **Vanilla JavaScript**: Game logic, API integration, and state management
- **Service Worker**: Offline support and caching
- **Web App Manifest**: PWA functionality

### Performance Optimizations
- ✅ Service Worker for caching static assets
- ✅ LocalStorage for caching API responses
- ✅ Lazy loading of Surah data
- ✅ Network-first strategy for API calls with cache fallback
- ✅ Optimized CSS with hardware-accelerated animations
- ✅ Minimal external dependencies

### Browser Support
- Chrome/Edge (recommended for PWA installation)
- Firefox
- Safari
- Any modern browser with ES6 support

## 📱 PWA Features

- ✅ Installable on desktop and mobile
- ✅ Works offline with cached data
- ✅ Standalone app experience
- ✅ Custom splash screen
- ✅ Responsive design for all screen sizes

## 🎨 Design Features

- Rainbow gradient backgrounds
- Smooth animations and transitions
- Kid-friendly emoji icons
- Responsive grid layouts
- Touch-friendly buttons and controls
- Custom scrollbar styling
- Colorful feedback for correct/incorrect answers

## 📂 File Structure

```
quran-memorization/
├── index.html          # Main HTML file
├── styles.css          # Stylesheet with animations
├── app.js              # Application logic
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker for offline support
├── icon-192.png        # App icon (192x192)
├── icon-512.png        # App icon (512x512)
└── README.md          # This file
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Quran API provided by [santrikoding.com](https://quran-api.santrikoding.com)
- Design inspired by modern educational games for children
- Built with ❤️ for the Muslim community

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

**May Allah accept this effort and make it beneficial for those who seek to memorize His words. Ameen.** 🤲