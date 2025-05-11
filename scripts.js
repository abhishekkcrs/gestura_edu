let video = document.getElementById('video');
let isStreaming = false;
let socket;
let frameInterval;
let currentCount = 5;
let selectedWord = null;

// Video URL mapping for each word
const videoMap = {
    'hello': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'mother': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'how': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'are': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'you': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'Lets': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'go': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'to': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'park': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'evening': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
};

// const DEFAULT_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

// Update counter display
function updateCounter(value) {
    const counterElement = document.querySelector('.counter-value');
    counterElement.textContent = value;
    counterElement.classList.add('changed');
    setTimeout(() => counterElement.classList.remove('changed'), 500);
}

// Reset counter
function resetCounter() {
    currentCount = 5;
    updateCounter(currentCount);
}

// Update WebSocket URL
function updateServerUrl() {
    const newUrl = document.getElementById('serverUrl').value;
    if (socket) {
        socket.close();
    }
    // Always hide the modal and update the URL
    document.getElementById('urlModal').classList.add('hidden');
    openSocket(newUrl);
}

// Open WebSocket connection
function openSocket(url = null) {
    const serverUrl = url || document.getElementById('serverUrl').value;
    socket = new WebSocket(serverUrl);

    socket.onopen = () => {
        console.log('WebSocket connection established');
        streamFrames();
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("The selected word is: " + selectedWord);
        console.log('Received WebSocket message:', data); // Debug log
        
        if (Array.isArray(data)) {
            // Get the most recently detected word
            const latestWord = data[data.length - 1];
            
            // Check if the detected word matches the selected word
            if (selectedWord && latestWord === selectedWord) {
                if (currentCount > 0) {
                    currentCount--;
                    updateCounter(currentCount);
                    
                    if (currentCount === 0) {
                        console.log('Gesture sequence completed!');
                        triggerConfetti(); // Trigger confetti animation
                    }
                }
            }
            
            // Update status with latest word
            const status = document.querySelector('.detection-status');
            if (latestWord) {
                status.textContent = `Detected: ${latestWord}`;
                status.style.color = '#2ecc71'; // Green color for success
                
                // Add to log
                const log = document.querySelector('.detection-log');
                const logEntry = document.createElement('div');
                logEntry.textContent = `${new Date().toLocaleTimeString()}: ${latestWord}`;
                logEntry.className = 'log-entry';
                log.insertBefore(logEntry, log.firstChild);
                
                // Keep only last 5 entries
                while (log.children.length > 5) {
                    log.removeChild(log.lastChild);
                }

                // If we have multiple words, show them as a sentence
                if (data.length > 1) {
                    const sentenceHint = document.createElement('div');
                    sentenceHint.className = 'sentence-hint';
                    sentenceHint.textContent = `Sentence: ${data.join(' ')}`;
                    log.insertBefore(sentenceHint, log.firstChild);
                }
            }
        }
        
        // Update counter if provided
        if (data.repetitions_remaining !== undefined) {
            const counterValue = document.querySelector('.counter-value');
            if (counterValue) {
                counterValue.textContent = data.repetitions_remaining;
            }
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
    };

    socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
    };
}

// Start webcam and stream frames
function startWebcam() {
    if (!isStreaming) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                isStreaming = true;
                openSocket();
            })
            .catch(err => console.error('Error accessing webcam:', err));
    }
}

// Stop webcam and streaming
function stopWebcam() {
    if (isStreaming) {
        let stream = video.srcObject;
        let tracks = stream.getTracks();

        tracks.forEach(track => track.stop());
        video.srcObject = null;
        isStreaming = false;

        clearInterval(frameInterval);

        if (socket) {
            socket.close();
        }
    }
}

// Capture video frame and send it as Uint8Array
function captureAndSendFrame() {
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
        let arrayBuffer = await blob.arrayBuffer();
        let uint8Array = new Uint8Array(arrayBuffer);
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(uint8Array);
        }
    }, 'image/jpeg', 0.8);
}

// Send frames at 30 FPS using WebSocket
function streamFrames() {
    frameInterval = setInterval(() => {
        if (isStreaming) {
            captureAndSendFrame();
        }
    }, 1000 / 30); // 30 FPS
}

// Dark Theme Logic
document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        let darkMode = localStorage.getItem("darkMode") === "true";

        function applyTheme() {
            document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
            themeToggle.textContent = darkMode ? "☀️" : "🌙";
        }

        themeToggle.addEventListener("click", () => {
            darkMode = !darkMode;
            localStorage.setItem("darkMode", darkMode);
            applyTheme();
        });

        applyTheme();
    }
});

// Function to convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    console.log('Converting YouTube URL:', url);
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    console.log('URL match result:', match);
    const result = match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
    console.log('Converted embed URL:', result);
    return result;
}

// Function to get video URL from lessons data
async function getVideoUrl(word) {
    try {
        console.log('Fetching video URL for word:', word);
        const response = await fetch('http://localhost:8000/api/lessons');
        const lessons = await response.json();
        console.log('Received lessons data:', lessons);
        
        // Search through all categories
        for (const category in lessons) {
            console.log('Checking category:', category);
            if (lessons[category][word]) {
                console.log('Found video URL:', lessons[category][word]);
                return lessons[category][word];
            }
        }
        console.log('No video URL found for word:', word);
        return null;
    } catch (error) {
        console.error('Error fetching video URL:', error);
        return null;
    }
}

// Function to handle video end
function handleVideoEnd(videoElement) {
    videoElement.currentTime = 0;
    videoElement.play();
}

// Function to restart video
function restartVideo(videoElement) {
    videoElement.currentTime = 0;
    videoElement.play();
}

// Handle word selection from side navigation
async function selectWord(word) {
    console.log('Selecting word:', word);
    selectedWord = word;
    resetCounter();
    
    // Update the selected word display
    const selectedWordElement = document.getElementById('selectedWord');
    if (selectedWordElement) {
        selectedWordElement.textContent = word;
    }
    
    // Update active state in navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.textContent === word) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Get video URL from lessons data
    const videoUrl = await getVideoUrl(word);
    console.log('Retrieved video URL:', videoUrl);
    
    // Update and play the corresponding video
    const videoContainer = document.querySelector('.video-player-container');
    if (!videoContainer) {
        console.error('Video container not found');
        return;
    }

    if (videoUrl) {
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            // Handle YouTube video
            const embedUrl = getYouTubeEmbedUrl(videoUrl);
            console.log('YouTube embed URL:', embedUrl);
            if (embedUrl) {
                videoContainer.innerHTML = `
                    <iframe 
                        width="100%" 
                        height="360" 
                        src="${embedUrl}?autoplay=1&mute=1&loop=1&playlist=${embedUrl.split('/').pop()}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                    <div class="video-controls">
                        <button class="btn-primary" onclick="document.querySelector('iframe').src = '${embedUrl}?autoplay=1&mute=1&loop=1&playlist=${embedUrl.split('/').pop()}'">Restart</button>
                    </div>
                `;
            } else {
                console.error('Invalid YouTube URL:', videoUrl);
            }
        } else {
            // Handle direct video URL
            videoContainer.innerHTML = `
                <video id="tutorialVideo" controls loop autoplay muted>
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="video-controls">
                    <button class="btn-primary" onclick="document.getElementById('tutorialVideo').play()">Play</button>
                    <button class="btn-primary" onclick="document.getElementById('tutorialVideo').pause()">Pause</button>
                    <button class="btn-primary" onclick="restartVideo(document.getElementById('tutorialVideo'))">Restart</button>
                </div>
            `;

            // Add event listener for video end
            const videoElement = document.getElementById('tutorialVideo');
            if (videoElement) {
                videoElement.addEventListener('ended', () => handleVideoEnd(videoElement));
            }
        }
    } else {
        console.log("No video URL found for word:", word);
        // Use default video if no URL found
        videoContainer.innerHTML = `
            <video id="tutorialVideo" controls loop autoplay muted>
                <source src="${DEFAULT_VIDEO_URL}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <div class="video-controls">
                <button class="btn-primary" onclick="document.getElementById('tutorialVideo').play()">Play</button>
                <button class="btn-primary" onclick="document.getElementById('tutorialVideo').pause()">Pause</button>
                <button class="btn-primary" onclick="restartVideo(document.getElementById('tutorialVideo'))">Restart</button>
            </div>
        `;

        // Add event listener for video end
        const videoElement = document.getElementById('tutorialVideo');
        if (videoElement) {
            videoElement.addEventListener('ended', () => handleVideoEnd(videoElement));
        }
    }
}

// Set selectedWord from the URL
function getLessonFromURL() {
    const params = new URLSearchParams(window.location.search);
    const lesson = params.get('lesson');
    return lesson ? lesson.replace(/_/g, ' ') : null;
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Show URL input modal
    document.getElementById('urlModal').classList.remove('hidden');
    
    // Start webcam automatically
    startWebcam();
    
    // Get lesson from URL and select it
    const lesson = getLessonFromURL();
    if (lesson) {
        console.log('Initializing with lesson from URL:', lesson);
        await selectWord(lesson);
    }
});

// Function to update detection feedback
function updateDetectionFeedback(words) {
    const status = document.querySelector('.detection-status');
    const log = document.querySelector('.detection-log');
    
    if (words && words.length > 0) {
        const latestWord = words[words.length - 1];
        status.textContent = `Detected: ${latestWord}`;
        status.style.color = '#2ecc71'; // Green color for success
        
        // Add to log
        const logEntry = document.createElement('div');
        logEntry.textContent = `${new Date().toLocaleTimeString()}: ${latestWord}`;
        logEntry.className = 'log-entry';
        log.insertBefore(logEntry, log.firstChild);
        
        // Keep only last 5 entries
        while (log.children.length > 5) {
            log.removeChild(log.lastChild);
        }

        // If we have multiple words, show a hint about sentence formation
        if (words.length > 1) {
            const sentenceHint = document.createElement('div');
            sentenceHint.className = 'sentence-hint';
            sentenceHint.textContent = `Words detected: ${words.join(', ')}`;
            log.insertBefore(sentenceHint, log.firstChild);
        }
    } else {
        status.textContent = 'Waiting for detection...';
        status.style.color = '#666';
    }
}

// Function to trigger confetti animation
function triggerConfetti() {
    const duration = 3 * 1000; // Increased to 5 seconds
    const animationEnd = Date.now() + duration;
    const defaults = { 
        startVelocity: 50, // Increased velocity
        spread: 360,
        ticks: 100, // Increased ticks
        zIndex: 0,
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'] // Added vibrant colors
    };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 100 * (timeLeft / duration); // Increased base particle count
        
        // Launch confetti from multiple positions
        // Left side
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        // Right side
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });

        // Center
        confetti({
            ...defaults,
            particleCount: particleCount * 0.5,
            origin: { x: 0.5, y: 0.5 }
        });
    }, 100); // Reduced interval for more frequent bursts
}
