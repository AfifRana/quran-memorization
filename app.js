// Application State
const state = {
    surahs: [],
    currentSurah: null,
    currentGame: null,
    currentQuestion: null,
    score: 0,
    gamesPlayed: 0,
    timer: 0,
    timerInterval: null,
    multiplayer: {
        isActive: false,
        isHost: false,
        roomName: null,
        players: [],
        ws: null
    }
};

// App Version for cache/localStorage invalidation
const APP_VERSION = '1.0.0';

// LocalStorage TTL (5 minutes in milliseconds)
const LOCALSTORAGE_TTL = 5 * 60 * 1000;

// API Configuration
const API_BASE_URL = 'https://quran-api.santrikoding.com/api';

// Helper functions for localStorage with TTL
function setLocalStorageWithTTL(key, value) {
    const item = {
        data: value,
        timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(item));
}

function getLocalStorageWithTTL(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    try {
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp > LOCALSTORAGE_TTL) {
            localStorage.removeItem(key);
            return null;
        }
        return parsed.data;
    } catch (e) {
        localStorage.removeItem(key);
        return null;
    }
}

// Check and clear stale localStorage
function checkAndClearStaleStorage() {
    const storedVersion = localStorage.getItem('appVersion');
    if (storedVersion !== APP_VERSION) {
        console.log('App version changed, clearing localStorage');
        localStorage.clear();
        localStorage.setItem('appVersion', APP_VERSION);
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
});

async function initializeApp() {
    try {
        // Check for stale localStorage and clear if needed
        checkAndClearStaleStorage();

        // Load cached data
        loadLocalStats();

        // Fetch Surahs
        await fetchSurahs();

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('service-worker.js');
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to load data. Please check your connection.');
    } finally {
        // Always hide loading screen and attempt to show main menu (guard DOM access)
        setTimeout(() => {
            const loading = document.getElementById('loading-screen');
            if (loading) loading.classList.remove('active');
            
            // Wait for fade out, then fade in menu
            setTimeout(() => {
                const main = document.getElementById('main-menu');
                if (main) main.classList.add('active');
            }, 500);
        }, 1500);
    }
}

// Screen Navigation
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    if (screens && screens.length) {
        screens.forEach(screen => {
            screen.classList.remove('active');
        });
    }

    const el = document.getElementById(screenId);
    if (el) el.classList.add('active');
}

function hideScreen(screenId) {
    const el = document.getElementById(screenId);
    if (el) el.classList.remove('active');
}

function showMainMenu() {
    showScreen('main-menu');
    stopTimer();
    
    // Stop multiplayer if active
    if (state.multiplayer.isActive && state.multiplayer.ws) {
        state.multiplayer.ws.close();
        state.multiplayer.isActive = false;
    }
}

function showGameMode() {
    showScreen('game-mode-screen');
}

function showSurahSelector() {
    renderSurahList();
    showScreen('surah-selector');
}

function showMultiplayerMenu() {
    showScreen('multiplayer-menu');
}

// API Functions
async function fetchSurahs() {
    try {
        // Check cache first
        const cached = getLocalStorageWithTTL('surahs');
        if (cached) {
            state.surahs = cached;
            console.log('Loaded surahs from cache');
            return;
        }
        
        const response = await fetch(`${API_BASE_URL}/surah`);
        const data = await response.json();
        
        if (data && data.data) {
            state.surahs = data.data;
            // Cache the data
            setLocalStorageWithTTL('surahs', data.data);
            console.log('Fetched and cached surahs:', state.surahs.length);
        }
    } catch (error) {
        console.error('Error fetching surahs:', error);
        // Use fallback data if API fails
        state.surahs = getFallbackSurahs();
    }
}

async function fetchSurahDetails(surahNumber) {
    try {
        // Check cache first
        const cacheKey = `surah_${surahNumber}`;
        const cached = getLocalStorageWithTTL(cacheKey);
        if (cached) {
            return cached;
        }
        
        const response = await fetch(`${API_BASE_URL}/surah/${surahNumber}`);
        const data = await response.json();
        
        if (data && data.data) {
            // Cache the surah details
            setLocalStorageWithTTL(cacheKey, data.data);
            return data.data;
        }
    } catch (error) {
        console.error('Error fetching surah details:', error);
    }
    
    // Return fallback data if API fails
    return getFallbackSurahDetails(surahNumber);
}

// Render Surah List
function renderSurahList() {
    const surahList = document.getElementById('surah-list');
    surahList.innerHTML = '';
    
    state.surahs.forEach(surah => {
        const surahItem = document.createElement('div');
        surahItem.className = 'surah-item';
        surahItem.innerHTML = `
            <div class="surah-number">${surah.nomor}</div>
            <div class="surah-name">${surah.nama}</div>
            <div class="surah-translation">${surah.arti}</div>
        `;
        surahItem.onclick = () => selectSurah(surah.nomor);
        surahList.appendChild(surahItem);
    });
}

async function selectSurah(surahNumber) {
    const surahDetails = await fetchSurahDetails(surahNumber);
    if (surahDetails) {
        state.currentSurah = surahDetails;
        showGameMode();
    }
}

// Game Functions
async function startGame(gameType) {
    state.currentGame = gameType;
    state.score = 0;
    
    // If no surah selected, use Al-Fatihah (1)
    if (!state.currentSurah) {
        state.currentSurah = await fetchSurahDetails(1);
    }
    
    // Verify surah loaded
    if (!state.currentSurah) {
        alert('Failed to load Surah data. Please try again.');
        return;
    }
    
    document.getElementById('current-surah').textContent = state.currentSurah.nama_latin;
    document.getElementById('game-score').textContent = state.score;
    
    // Show game screen
    showScreen('game-screen');
    
    // Hide all game contents
    document.querySelectorAll('.game-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Show specific game
    document.getElementById(`${gameType}-game`).classList.add('active');
    
    // Start timer
    startTimer();
    
    // Load first question
    await loadQuestion();
}

async function loadQuestion() {
    if (!state.currentSurah || !state.currentSurah.ayat) {
        console.error('No surah data available');
        return;
    }
    
    const ayat = state.currentSurah.ayat;
    if (ayat.length === 0) return;
    
    // Select random ayat
    const randomIndex = Math.floor(Math.random() * ayat.length);
    state.currentQuestion = ayat[randomIndex];
    
    // Load question based on game type
    switch (state.currentGame) {
        case 'continue':
            loadContinueQuestion();
            break;
        case 'puzzle':
            loadPuzzleQuestion();
            break;
        case 'guess':
            loadGuessQuestion();
            break;
    }
}

// Continue Ayat Game
function loadContinueQuestion() {
    const ayat = state.currentQuestion;
    const words = ayat.ar.split(' ');
    
    // Show first half of the ayat
    const halfPoint = Math.ceil(words.length / 2);
    const firstHalf = words.slice(0, halfPoint).join(' ');
    const secondHalf = words.slice(halfPoint).join(' ');
    
    document.getElementById('continue-question').textContent = firstHalf + ' ...';
    
    // Generate options
    const options = generateContinueOptions(secondHalf);
    const optionsContainer = document.getElementById('continue-options');
    optionsContainer.innerHTML = '';
    
    options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkContinueAnswer(option, secondHalf, btn);
        optionsContainer.appendChild(btn);
    });
}

function generateContinueOptions(correctAnswer) {
    const options = [correctAnswer];
    const ayat = state.currentSurah.ayat;
    
    // Add random wrong answers
    while (options.length < 4) {
        const randomAyat = ayat[Math.floor(Math.random() * ayat.length)];
        const words = randomAyat.ar.split(' ');
        const halfPoint = Math.ceil(words.length / 2);
        const wrongAnswer = words.slice(halfPoint).join(' ');
        
        if (!options.includes(wrongAnswer)) {
            options.push(wrongAnswer);
        }
    }
    
    // Shuffle options
    return shuffleArray(options);
}

function checkContinueAnswer(selected, correct, button) {
    if (selected === correct) {
        button.classList.add('correct');
        showResult(true, 'Correct! 🎉', `The continuation was: ${correct}`);
        state.score += 10;
    } else {
        button.classList.add('wrong');
        showResult(false, 'Not quite! 😊', `The correct answer was: ${correct}`);
    }
    
    document.getElementById('game-score').textContent = state.score;
    
    // Disable all buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.onclick = null;
        btn.style.cursor = 'not-allowed';
    });
}

// Puzzle Ayat Game
function loadPuzzleQuestion() {
    const ayat = state.currentQuestion;
    const words = ayat.ar.split(' ');
    
    // Shuffle words
    const shuffledWords = shuffleArray([...words]);
    
    const wordBank = document.getElementById('puzzle-word-bank');
    wordBank.innerHTML = '';
    
    shuffledWords.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.textContent = word;
        wordItem.draggable = true;
        wordItem.dataset.word = word;
        
        wordItem.addEventListener('dragstart', handleDragStart);
        wordItem.addEventListener('dragend', handleDragEnd);
        
        wordBank.appendChild(wordItem);
    });
    
    // Setup drop zone
    const dropZone = document.getElementById('puzzle-drop-zone');
    dropZone.innerHTML = '<p style="color: #999;">Drag words here in correct order</p>';
    dropZone.dataset.correctAnswer = ayat.ar;
    
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleDrop);
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = e.target;
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const dropZone = document.getElementById('puzzle-drop-zone');
    
    if (draggedElement) {
        // Remove placeholder text if exists
        const placeholder = dropZone.querySelector('p');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Clone and add to drop zone
        const clone = draggedElement.cloneNode(true);
        clone.draggable = false;
        clone.onclick = () => clone.remove();
        dropZone.appendChild(clone);
        
        // Remove from word bank
        draggedElement.remove();
    }
}

function checkPuzzleAnswer() {
    const dropZone = document.getElementById('puzzle-drop-zone');
    const correctAnswer = dropZone.dataset.correctAnswer;
    const words = Array.from(dropZone.querySelectorAll('.word-item')).map(el => el.textContent);
    const userAnswer = words.join(' ');
    
    if (userAnswer === correctAnswer) {
        showResult(true, 'Perfect! 🎉', 'You arranged the words correctly!');
        state.score += 15;
    } else {
        showResult(false, 'Try again! 😊', `Correct order: ${correctAnswer}`);
    }
    
    document.getElementById('game-score').textContent = state.score;
}

// Guess Ayat Game
function loadGuessQuestion() {
    const ayat = state.currentQuestion;
    
    // Show translation as hint
    const hint = ayat.tr || ayat.idn || 'Guess the correct Ayat!';
    document.getElementById('guess-hint').textContent = `Translation: ${hint}`;
    
    // Generate options
    const options = generateGuessOptions(ayat.ar);
    const optionsContainer = document.getElementById('guess-options');
    optionsContainer.innerHTML = '';
    
    options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option.text;
        btn.onclick = () => checkGuessAnswer(option.isCorrect, btn, ayat.ar);
        optionsContainer.appendChild(btn);
    });
}

function generateGuessOptions(correctAnswer) {
    const options = [{ text: correctAnswer, isCorrect: true }];
    const ayat = state.currentSurah.ayat;
    
    // Add random wrong answers
    while (options.length < 4) {
        const randomAyat = ayat[Math.floor(Math.random() * ayat.length)];
        if (!options.some(opt => opt.text === randomAyat.ar)) {
            options.push({ text: randomAyat.ar, isCorrect: false });
        }
    }
    
    // Shuffle options
    return shuffleArray(options);
}

function checkGuessAnswer(isCorrect, button, correctText) {
    if (isCorrect) {
        button.classList.add('correct');
        showResult(true, 'Excellent! 🎉', 'You guessed correctly!');
        state.score += 10;
    } else {
        button.classList.add('wrong');
        showResult(false, 'Not quite! 😊', `Correct Ayat: ${correctText}`);
    }
    
    document.getElementById('game-score').textContent = state.score;
    
    // Disable all buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.onclick = null;
        btn.style.cursor = 'not-allowed';
    });
}

// Result Display
function showResult(isCorrect, message, detail) {
    const resultDisplay = document.getElementById('result-display');
    const resultIcon = document.getElementById('result-icon');
    const resultMessage = document.getElementById('result-message');
    const resultDetail = document.getElementById('result-detail');
    
    resultIcon.textContent = isCorrect ? '🎉' : '😊';
    resultMessage.textContent = message;
    resultDetail.textContent = detail;
    
    resultDisplay.classList.add('active');
}

function hideResult() {
    document.getElementById('result-display').classList.remove('active');
}

function nextQuestion() {
    hideResult();
    loadQuestion();
}

// Timer Functions
function startTimer() {
    state.timer = 0;
    updateTimerDisplay();
    
    state.timerInterval = setInterval(() => {
        state.timer++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.timer / 60).toString().padStart(2, '0');
    const seconds = (state.timer % 60).toString().padStart(2, '0');
    document.getElementById('game-timer').textContent = `${minutes}:${seconds}`;
}

// Multiplayer Functions
function hostGame() {
    const roomName = document.getElementById('room-name').value.trim();
    if (!roomName) {
        alert('Please enter a room name');
        return;
    }
    
    state.multiplayer.isActive = true;
    state.multiplayer.isHost = true;
    state.multiplayer.roomName = roomName;
    
    // Simulate multiplayer (WebRTC would be used in production)
    document.getElementById('room-info').style.display = 'block';
    document.getElementById('current-room').textContent = roomName;
    document.getElementById('player-count').textContent = '1';
    
    alert(`Room "${roomName}" created! Share this room name with your friends.`);
    
    // Store room in localStorage for local network simulation
    setLocalStorageWithTTL(`room_${roomName}`, {
        host: true,
        players: 1,
        timestamp: Date.now()
    });
}

function joinGame() {
    const roomName = document.getElementById('join-room-name').value.trim();
    if (!roomName) {
        alert('Please enter a room name');
        return;
    }
    
    // Check if room exists (simulated)
    const room = getLocalStorageWithTTL(`room_${roomName}`);
    if (!room) {
        alert('Room not found. Please check the room name.');
        return;
    }
    
    state.multiplayer.isActive = true;
    state.multiplayer.isHost = false;
    state.multiplayer.roomName = roomName;
    
    document.getElementById('room-info').style.display = 'block';
    document.getElementById('current-room').textContent = roomName;
    
    const roomData = room;
    roomData.players++;
    setLocalStorageWithTTL(`room_${roomName}`, roomData);
    
    document.getElementById('player-count').textContent = roomData.players;
    
    alert(`Joined room "${roomName}"!`);
}

function startMultiplayerGame() {
    if (!state.multiplayer.isActive) {
        return;
    }
    
    alert('Starting multiplayer game! All players will compete for the highest score.');
    showGameMode();
}

// Utility Functions
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function loadLocalStats() {
    const stats = getLocalStorageWithTTL('gameStats');
    if (stats) {
        state.score = stats.totalScore || 0;
        state.gamesPlayed = stats.gamesPlayed || 0;
        
        document.getElementById('total-score').textContent = state.score;
        document.getElementById('games-played').textContent = state.gamesPlayed;
    }
}

function saveLocalStats() {
    state.gamesPlayed++;
    
    const stats = {
        totalScore: state.score,
        gamesPlayed: state.gamesPlayed
    };
    
    setLocalStorageWithTTL('gameStats', stats);
    
    document.getElementById('total-score').textContent = state.score;
    document.getElementById('games-played').textContent = state.gamesPlayed;
}

// Fallback data in case API is unavailable
function getFallbackSurahs() {
    return [
        { nomor: 1, nama: "الفاتحة", nama_latin: "Al-Fatihah", arti: "The Opening" },
        { nomor: 2, nama: "البقرة", nama_latin: "Al-Baqarah", arti: "The Cow" },
        { nomor: 3, nama: "آل عمران", nama_latin: "Ali 'Imran", arti: "Family of Imran" },
        { nomor: 4, nama: "النساء", nama_latin: "An-Nisa", arti: "The Women" },
        { nomor: 5, nama: "المائدة", nama_latin: "Al-Ma'idah", arti: "The Table" }
    ];
}

function getFallbackSurahDetails(surahNumber) {
    // Fallback data for Al-Fatihah with sample ayat
    if (surahNumber === 1) {
        return {
            nomor: 1,
            nama: "الفاتحة",
            nama_latin: "Al-Fatihah",
            arti: "The Opening",
            jumlah_ayat: 7,
            ayat: [
                {
                    nomor: 1,
                    ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                    tr: "Bismillaahir Rahmaanir Raheem",
                    idn: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang"
                },
                {
                    nomor: 2,
                    ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                    tr: "Alhamdu lillaahi Rabbil 'aalameen",
                    idn: "Segala puji bagi Allah, Tuhan seluruh alam"
                },
                {
                    nomor: 3,
                    ar: "الرَّحْمَٰنِ الرَّحِيمِ",
                    tr: "Ar-Rahmaanir-Raheem",
                    idn: "Yang Maha Pengasih, Maha Penyayang"
                },
                {
                    nomor: 4,
                    ar: "مَالِكِ يَوْمِ الدِّينِ",
                    tr: "Maaliki Yawmid-Deen",
                    idn: "Pemilik hari pembalasan"
                },
                {
                    nomor: 5,
                    ar: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
                    tr: "Iyyaaka na'budu wa lyyaaka nasta'een",
                    idn: "Hanya kepada Engkaulah kami menyembah dan hanya kepada Engkaulah kami mohon pertolongan"
                },
                {
                    nomor: 6,
                    ar: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
                    tr: "Ihdinas-Siraatal-Mustaqeem",
                    idn: "Tunjukilah kami jalan yang lurus"
                },
                {
                    nomor: 7,
                    ar: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
                    tr: "Siraatal-lazeena an'amta 'alaihim ghayril-maghdoobi 'alaihim wa lad-daaalleen",
                    idn: "(yaitu) jalan orang-orang yang telah Engkau beri nikmat kepadanya; bukan (jalan) mereka yang dimurkai, dan bukan (pula jalan) mereka yang sesat"
                }
            ]
        };
    }
    
    // For other surahs, return a simple structure
    const surah = state.surahs.find(s => s.nomor === surahNumber);
    if (surah) {
        return {
            ...surah,
            jumlah_ayat: 7,
            ayat: [
                {
                    nomor: 1,
                    ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                    tr: "Bismillaahir Rahmaanir Raheem",
                    idn: "Dengan nama Allah Yang Maha Pengasih, Maha Penyayang"
                },
                {
                    nomor: 2,
                    ar: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                    tr: "Alhamdu lillaahi Rabbil 'aalameen",
                    idn: "Segala puji bagi Allah, Tuhan seluruh alam"
                }
            ]
        };
    }
    
    return null;
}

// Install prompt for PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install button
    console.log('App can be installed');
});

window.addEventListener('appinstalled', () => {
    console.log('App installed successfully');
    deferredPrompt = null;
});
