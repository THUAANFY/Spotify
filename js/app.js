// DOM Elements
const audioPlayer = document.getElementById("audio-player")
const playButton = document.getElementById("play-button")
const prevButton = document.getElementById("prev-button")
const nextButton = document.getElementById("next-button")
const shuffleButton = document.getElementById("shuffle-toggle")
const repeatButton = document.getElementById("repeat-toggle")
const progressBar = document.getElementById("progress-bar")
const progressHandle = document.getElementById("progress-handle")
const currentTimeDisplay = document.getElementById("current-time")
const totalTimeDisplay = document.getElementById("total-time")
const volumeBar = document.getElementById("volume-bar")
const volumeHandle = document.getElementById("volume-handle")
const muteButton = document.getElementById("mute-button")
const currentCover = document.getElementById("current-cover")
const currentTitle = document.getElementById("current-title")
const currentArtist = document.getElementById("current-artist")
const likeCurrentButton = document.getElementById("like-current")
const songsContainer = document.getElementById("songs-container")
const playAllButton = document.getElementById("play-all-button")
const playlistInfo = document.getElementById("playlist-info")
const totalDurationDisplay = document.getElementById("total-duration")
const loadingOverlay = document.getElementById("loading-overlay")
const notificationToast = document.getElementById("notification-toast")
const notificationMessage = document.getElementById("notification-message")
const notificationIcon = document.getElementById("notification-icon")
const mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle")
const mobileSidebar = document.getElementById("mobile-sidebar")
const closeMobileSidebar = document.getElementById("close-mobile-sidebar")
const lyricsButton = document.getElementById("lyrics-button")
const lyricsModal = document.getElementById("lyrics-modal")
const closeLyrics = document.getElementById("close-lyrics")
const lyricsCover = document.getElementById("lyrics-cover")
const lyricsTitle = document.getElementById("lyrics-title")
const lyricsArtist = document.getElementById("lyrics-artist")
const lyricsContent = document.getElementById("lyrics-content")
const backButton = document.getElementById("back-button")
const forwardButton = document.getElementById("forward-button")
const fullscreenButton = document.getElementById("fullscreen-button")

// Player state
let songs = []
let currentSongIndex = 0
let isPlaying = false
let isShuffle = false
let repeatMode = 0 // 0: no repeat, 1: repeat all, 2: repeat one
let volume = 0.7
let previousVolume = 0.7
let isDraggingProgress = false
let isDraggingVolume = false
let navigationHistory = []
let navigationPosition = -1
let isFullscreen = false

// Initialize player
async function initPlayer() {
  try {
    showLoading(true)

    // Fetch songs from JSON file
    await loadSongsFromJSON()

    // Render songs
    renderSongs()

    // Update playlist info
    updatePlaylistInfo()

    // Set initial volume
    audioPlayer.volume = volume
    updateVolumeUI()

    // Add event listeners
    setupEventListeners()

    // Load player state if available
    loadPlayerState()

    console.log("Player initialized successfully with", songs.length, "songs")

    // Hide loading overlay with a slight delay for smoother transition
    setTimeout(() => {
      showLoading(false)
      showNotification("Trình phát nhạc đã sẵn sàng", "success")
    }, 1200)
  } catch (error) {
    console.error("Error initializing player:", error)
    showNotification("Không thể tải danh sách nhạc. Vui lòng thử lại sau.", "error")
    showLoading(false)
  }
}

// Show/hide loading overlay
function showLoading(show) {
  if (show) {
    loadingOverlay.style.display = "flex"
  } else {
    loadingOverlay.style.opacity = "0"
    setTimeout(() => {
      loadingOverlay.style.display = "none"
      loadingOverlay.style.opacity = "1"
    }, 300)
  }
}

// Show notification toast
function showNotification(message, type = "success") {
  // Set icon based on notification type
  if (type === "success") {
    notificationIcon.className = "fa-solid fa-circle-check text-spotify-green"
  } else if (type === "error") {
    notificationIcon.className = "fa-solid fa-circle-exclamation text-red-500"
  } else if (type === "info") {
    notificationIcon.className = "fa-solid fa-circle-info text-blue-500"
  }

  notificationMessage.textContent = message

  // Add shimmer effect to notification
  notificationToast.classList.add("show", "shimmer")

  // Show the notification with enhanced animation
  notificationToast.style.opacity = "0"
  notificationToast.style.transform = "translateY(-20px)"

  setTimeout(() => {
    notificationToast.style.opacity = "1"
    notificationToast.style.transform = "translateY(0)"
  }, 10)

  // Hide after 3 seconds with enhanced animation
  setTimeout(() => {
    notificationToast.style.opacity = "0"
    notificationToast.style.transform = "translateY(-20px)"

    setTimeout(() => {
      notificationToast.classList.remove("show", "shimmer")
    }, 300)
  }, 3000)
}

// Load songs from JSON file
async function loadSongsFromJSON() {
  try {
    const response = await fetch("data/songs.json")

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()
    songs = data.songs || []

    if (songs.length === 0) {
      console.warn("No songs found in the JSON file")
    }

    return songs
  } catch (error) {
    console.error("Error loading songs from JSON:", error)
    throw error
  }
}

// Render songs in the table
function renderSongs() {
  songsContainer.innerHTML = ""

  if (songs.length === 0) {
    songsContainer.innerHTML = `
            <tr>
                <td colspan="5" class="px-4 py-8 text-center text-gray-400">
                    <i class="fa-solid fa-music text-3xl mb-2"></i>
                    <p>Không có bài hát nào trong danh sách phát</p>
                </td>
            </tr>
        `
    return
  }

  songs.forEach((song, index) => {
    const row = document.createElement("tr")
    row.className = "song-row hover:bg-white/10 transition-all duration-300"
    row.dataset.id = song.id
    row.dataset.index = index
    row.style.animationDelay = `${index * 0.05}s`

    if (index === currentSongIndex && isPlaying) {
      row.classList.add("playing")
    }

    // Create playing animation for current song
    let playingIndicator = ""
    if (index === currentSongIndex && isPlaying) {
      playingIndicator = `
                <div class="wave-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `
    }

    row.innerHTML = `
            <td class="px-4 py-3">
                ${
                  index === currentSongIndex && isPlaying
                    ? playingIndicator
                    : `<span class="song-number">${index + 1}</span>
                    <i class="fa-solid fa-play play-icon"></i>`
                }
            </td>
            <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-md shadow-sm overflow-hidden transform transition-all duration-300 hover:shadow-md hover:scale-105">
                        <img src="${song.coverUrl}" alt="${song.title}" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <div class="font-medium song-title ${index === currentSongIndex ? "text-spotify-green" : ""}">${song.title}</div>
                        <div class="text-gray-400">${song.artist}</div>
                    </div>
                </div>
            </td>
            <td class="px-4 py-3 hidden md:table-cell">${song.album}</td>
            <td class="px-4 py-3 hidden lg:table-cell">${formatDate(song.dateAdded)}</td>
            <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-4">
                    <button class="like-button ${song.liked ? "active" : ""} p-2" data-id="${song.id}">
                        <i class="fa-${song.liked ? "solid" : "regular"} fa-heart"></i>
                    </button>
                    <span>${formatTime(song.duration)}</span>
                    <button class="more-button text-gray-400 hover:text-white p-2 hover:scale-110 transition-transform duration-200">
                        <i class="fa-solid fa-ellipsis"></i>
                    </button>
                </div>
            </td>
        `

    songsContainer.appendChild(row)
  })

  // Add event listeners to song rows
  document.querySelectorAll(".song-row").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (!e.target.closest(".like-button") && !e.target.closest(".more-button")) {
        const index = Number.parseInt(row.dataset.index)
        if (index === currentSongIndex && isPlaying) {
          pauseSong()
        } else {
          playSongAtIndex(index)
        }
      }
    })
  })

  // Add event listeners to like buttons
  document.querySelectorAll(".like-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation()
      const songId = Number.parseInt(button.dataset.id)
      toggleLike(songId)
    })
  })
}

// Update playlist info
function updatePlaylistInfo() {
  playlistInfo.textContent = `${songs.length} bài hát`

  // Calculate total duration
  const totalSeconds = songs.reduce((total, song) => total + song.duration, 0)
  totalDurationDisplay.textContent = formatTime(totalSeconds, true)
}

// Format time from seconds to MM:SS or HH:MM:SS
function formatTime(seconds, showHours = false) {
  if (isNaN(seconds) || seconds < 0) return "0:00"

  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (showHours && hours > 0) {
    return `${hours}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString("vi-VN", { year: "numeric", month: "short", day: "numeric" })
}

// Toggle like status for a song
function toggleLike(songId) {
  const songIndex = songs.findIndex((song) => song.id === songId)

  if (songIndex !== -1) {
    songs[songIndex].liked = !songs[songIndex].liked

    // Update UI with enhanced animation
    const likeButton = document.querySelector(`.like-button[data-id="${songId}"]`)
    if (likeButton) {
      if (songs[songIndex].liked) {
        likeButton.classList.add("active")
        likeButton.innerHTML = '<i class="fa-solid fa-heart"></i>'

        // Add heart animation
        const heart = document.createElement("div")
        heart.innerHTML = '<i class="fa-solid fa-heart text-spotify-green"></i>'
        heart.style.position = "absolute"
        heart.style.fontSize = "1.5rem"
        heart.style.top = "50%"
        heart.style.left = "50%"
        heart.style.transform = "translate(-50%, -50%)"
        heart.style.opacity = "0"
        heart.style.pointerEvents = "none"
        likeButton.appendChild(heart)

        // Animate the heart
        heart.animate(
          [
            { transform: "translate(-50%, -50%) scale(0)", opacity: 1 },
            { transform: "translate(-50%, -50%) scale(1.5)", opacity: 0 },
          ],
          {
            duration: 700,
            easing: "ease-out",
          },
        ).onfinish = () => heart.remove()

        showNotification("Đã thêm vào danh sách yêu thích", "success")
      } else {
        likeButton.classList.remove("active")
        likeButton.innerHTML = '<i class="fa-regular fa-heart"></i>'
        showNotification("Đã xóa khỏi danh sách yêu thích", "info")
      }
    }

    // Update current song like button if needed
    if (songIndex === currentSongIndex) {
      updateCurrentSongLikeButton()
    }

    // Save player state
    savePlayerState()
  }
}

// Update the like button for the current song
function updateCurrentSongLikeButton() {
  if (songs[currentSongIndex]) {
    if (songs[currentSongIndex].liked) {
      likeCurrentButton.classList.add("active")
      likeCurrentButton.innerHTML = '<i class="fa-solid fa-heart"></i>'
      likeCurrentButton.style.color = "#1DB954"
    } else {
      likeCurrentButton.classList.remove("active")
      likeCurrentButton.innerHTML = '<i class="fa-regular fa-heart"></i>'
      likeCurrentButton.style.color = ""
    }
  }
}

// Play song at specific index
function playSongAtIndex(index) {
  if (index >= 0 && index < songs.length) {
    currentSongIndex = index
    loadCurrentSong()
    playSong()

    // Add to navigation history
    addToHistory(index)
  }
}

// Load current song
function loadCurrentSong() {
  const song = songs[currentSongIndex]

  // Update audio source
  audioPlayer.src = song.audioUrl
  audioPlayer.load()

  // Update player UI
  currentCover.src = song.coverUrl
  currentTitle.textContent = song.title
  currentArtist.textContent = song.artist
  totalTimeDisplay.textContent = formatTime(song.duration)

  // Update document title
  document.title = `${song.title} - ${song.artist} | Spotify`

  // Update like button
  updateCurrentSongLikeButton()

  // Update lyrics modal if open
  updateLyricsModal()

  // Update song list UI
  renderSongs()
}

// Update lyrics modal with current song info
function updateLyricsModal() {
  if (songs[currentSongIndex]) {
    const song = songs[currentSongIndex]
    lyricsCover.src = song.coverUrl
    lyricsTitle.textContent = song.title
    lyricsArtist.textContent = song.artist

    // Check if song has lyrics
    if (song.lyrics) {
      lyricsContent.textContent = song.lyrics
    } else {
      lyricsContent.textContent = "Chưa có lời bài hát cho bài này."
    }
  }
}

// Play song
function playSong() {
  audioPlayer
    .play()
    .then(() => {
      isPlaying = true
      updatePlayButtonUI()
      showNotification(`Đang phát: ${songs[currentSongIndex].title}`, "info")
    })
    .catch((error) => {
      console.error("Error playing audio:", error)
      showNotification("Không thể phát bài hát. Vui lòng kiểm tra lại file nhạc.", "error")
    })
}

// Pause song
function pauseSong() {
  audioPlayer.pause()
  isPlaying = false
  updatePlayButtonUI()
  showNotification("Đã tạm dừng", "info")
}

// Update play button UI
function updatePlayButtonUI() {
  if (isPlaying) {
    playButton.innerHTML = '<i class="fa-solid fa-pause"></i>'
    playAllButton.innerHTML = '<i class="fa-solid fa-pause"></i>'
  } else {
    playButton.innerHTML = '<i class="fa-solid fa-play ml-0.5"></i>'
    playAllButton.innerHTML = '<i class="fa-solid fa-play ml-0.5"></i>'
  }

  // Update song list
  renderSongs()

  // Save player state
  savePlayerState()
}

// Play next song
function playNextSong() {
  let nextIndex

  if (isShuffle) {
    // Get random index different from current
    nextIndex = getRandomSongIndex()
  } else {
    nextIndex = (currentSongIndex + 1) % songs.length
  }

  playSongAtIndex(nextIndex)
}

// Play previous song
function playPreviousSong() {
  // If current time > 3 seconds, restart song instead of going to previous
  if (audioPlayer.currentTime > 3) {
    audioPlayer.currentTime = 0
    return
  }

  let prevIndex

  if (isShuffle) {
    // Get random index different from current
    prevIndex = getRandomSongIndex()
  } else {
    prevIndex = (currentSongIndex - 1 + songs.length) % songs.length
  }

  playSongAtIndex(prevIndex)
}

// Get random song index (different from current)
function getRandomSongIndex() {
  if (songs.length <= 1) return 0

  let randomIndex
  do {
    randomIndex = Math.floor(Math.random() * songs.length)
  } while (randomIndex === currentSongIndex)

  return randomIndex
}

// Toggle shuffle
function toggleShuffle() {
  isShuffle = !isShuffle

  if (isShuffle) {
    shuffleButton.classList.add("control-active")
    showNotification("Đã bật chế độ phát ngẫu nhiên", "success")
  } else {
    shuffleButton.classList.remove("control-active")
    showNotification("Đã tắt chế độ phát ngẫu nhiên", "info")
  }

  // Save player state
  savePlayerState()
}

// Toggle repeat mode
function toggleRepeat() {
  repeatMode = (repeatMode + 1) % 3

  switch (repeatMode) {
    case 0: // No repeat
      repeatButton.classList.remove("control-active")
      repeatButton.innerHTML = '<i class="fa-solid fa-repeat"></i>'
      showNotification("Đã tắt chế độ lặp lại", "info")
      break
    case 1: // Repeat all
      repeatButton.classList.add("control-active")
      repeatButton.innerHTML = '<i class="fa-solid fa-repeat"></i>'
      showNotification("Đã bật chế độ lặp lại tất cả", "success")
      break
    case 2: // Repeat one
      repeatButton.classList.add("control-active")
      repeatButton.innerHTML = '<i class="fa-solid fa-repeat-1"></i>'
      showNotification("Đã bật chế độ lặp lại một bài", "success")
      break
  }

  // Save player state
  savePlayerState()
}

// Update progress bar
function updateProgress() {
  if (!isDraggingProgress && audioPlayer.duration) {
    const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100
    progressBar.style.width = `${percent}%`
    progressHandle.style.left = `${percent}%`
    currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime)
  }
}

// Seek to position
function seekTo(percent) {
  if (audioPlayer.duration) {
    const seekTime = (percent / 100) * audioPlayer.duration
    audioPlayer.currentTime = seekTime
    updateProgress()
  }
}

// Update volume UI
function updateVolumeUI() {
  volumeBar.style.width = `${volume * 100}%`
  volumeHandle.style.left = `${volume * 100}%`

  // Update mute button icon
  if (volume === 0) {
    muteButton.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>'
  } else if (volume < 0.5) {
    muteButton.innerHTML = '<i class="fa-solid fa-volume-low"></i>'
  } else {
    muteButton.innerHTML = '<i class="fa-solid fa-volume-high"></i>'
  }
}

// Toggle mute
function toggleMute() {
  if (audioPlayer.volume > 0) {
    previousVolume = audioPlayer.volume
    audioPlayer.volume = 0
    volume = 0
    showNotification("Đã tắt âm thanh", "info")
  } else {
    audioPlayer.volume = previousVolume
    volume = previousVolume
    showNotification("Đã bật âm thanh", "success")
  }

  updateVolumeUI()
  savePlayerState()
}

// Set volume
function setVolume(percent) {
  volume = Math.max(0, Math.min(1, percent / 100))
  audioPlayer.volume = volume
  updateVolumeUI()
  savePlayerState()
}

// Save player state to localStorage
function savePlayerState() {
  const state = {
    currentSongIndex,
    isPlaying,
    volume,
    isShuffle,
    repeatMode,
    currentTime: audioPlayer.currentTime || 0,
    songLikes: songs.map((song) => ({ id: song.id, liked: song.liked })),
  }

  localStorage.setItem("playerState", JSON.stringify(state))
}

// Load player state from localStorage
function loadPlayerState() {
  try {
    const savedState = localStorage.getItem("playerState")

    if (savedState) {
      const state = JSON.parse(savedState)

      // Validate state properties
      if (
        typeof state.currentSongIndex === "number" &&
        state.currentSongIndex >= 0 &&
        state.currentSongIndex < songs.length
      ) {
        currentSongIndex = state.currentSongIndex

        if (typeof state.volume === "number") {
          volume = state.volume
          audioPlayer.volume = volume
        }

        if (typeof state.isShuffle === "boolean") {
          isShuffle = state.isShuffle
          if (isShuffle) {
            shuffleButton.classList.add("control-active")
          }
        }

        if (typeof state.repeatMode === "number") {
          repeatMode = state.repeatMode
          updateRepeatButtonUI()
        }

        // Restore liked songs
        if (state.songLikes && Array.isArray(state.songLikes)) {
          state.songLikes.forEach((likeState) => {
            const songIndex = songs.findIndex((song) => song.id === likeState.id)
            if (songIndex !== -1) {
              songs[songIndex].liked = likeState.liked
            }
          })
        }

        loadCurrentSong()

        if (typeof state.currentTime === "number") {
          audioPlayer.currentTime = state.currentTime
        }

        updateVolumeUI()

        // Don't auto-play when loading state
        // if (state.isPlaying) {
        //     playSong();
        // }
      }
    }
  } catch (error) {
    console.error("Error loading player state:", error)
  }
}

// Update repeat button UI based on current repeat mode
function updateRepeatButtonUI() {
  switch (repeatMode) {
    case 0: // No repeat
      repeatButton.classList.remove("control-active")
      repeatButton.innerHTML = '<i class="fa-solid fa-repeat"></i>'
      break
    case 1: // Repeat all
      repeatButton.classList.add("control-active")
      repeatButton.innerHTML = '<i class="fa-solid fa-repeat"></i>'
      break
    case 2: // Repeat one
      repeatButton.classList.add("control-active")
      repeatButton.innerHTML = '<i class="fa-solid fa-repeat-1"></i>'
      break
  }
}

// Search songs
function searchSongs(query) {
  if (!query || query.trim() === "") {
    renderSongs()
    return
  }

  query = query.toLowerCase()

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.album.toLowerCase().includes(query),
  )

  // Temporarily replace songs array for rendering
  const originalSongs = [...songs]
  songs = filteredSongs
  renderSongs()
  songs = originalSongs
}

// Toggle mobile sidebar
function toggleMobileSidebar() {
  mobileSidebar.classList.toggle("open")

  // Apply wider sidebar
  if (mobileSidebar.classList.contains("open")) {
    mobileSidebar.style.transform = "translateX(0)"
  } else {
    mobileSidebar.style.transform = "translateX(-100%)"
  }
}

// Toggle lyrics modal
function toggleLyricsModal() {
  if (lyricsModal.style.opacity === "1") {
    lyricsModal.style.opacity = "0"
    setTimeout(() => {
      lyricsModal.style.display = "none"
    }, 300)
  } else {
    updateLyricsModal()
    lyricsModal.style.display = "block"
    setTimeout(() => {
      lyricsModal.style.opacity = "1"
    }, 10)
  }
}

// Add to navigation history
function addToHistory(index) {
  // If we're not at the end of the history, truncate it
  if (navigationPosition < navigationHistory.length - 1) {
    navigationHistory = navigationHistory.slice(0, navigationPosition + 1)
  }

  // Add current index to history
  navigationHistory.push(index)
  navigationPosition = navigationHistory.length - 1

  // Update navigation buttons
  updateNavigationButtons()
}

// Navigate back
function navigateBack() {
  if (navigationPosition > 0) {
    navigationPosition--
    playSongAtIndex(navigationHistory[navigationPosition])

    // Don't add this to history again
    navigationHistory.pop()

    // Update navigation buttons
    updateNavigationButtons()
  }
}

// Navigate forward
function navigateForward() {
  if (navigationPosition < navigationHistory.length - 1) {
    navigationPosition++
    playSongAtIndex(navigationHistory[navigationPosition])

    // Update navigation buttons
    updateNavigationButtons()
  }
}

// Update navigation buttons
function updateNavigationButtons() {
  backButton.classList.toggle("text-gray-600", navigationPosition <= 0)
  forwardButton.classList.toggle("text-gray-600", navigationPosition >= navigationHistory.length - 1)
}

// Toggle fullscreen mode
function toggleFullscreen() {
  isFullscreen = !isFullscreen

  if (isFullscreen) {
    document.documentElement.requestFullscreen().catch((err) => {
      console.error("Error attempting to enable fullscreen:", err)
    })
    fullscreenButton.innerHTML = '<i class="fa-solid fa-compress"></i>'
    showNotification("Đã bật chế độ toàn màn hình", "success")
  } else {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        console.error("Error attempting to exit fullscreen:", err)
      })
    }
    fullscreenButton.innerHTML = '<i class="fa-solid fa-expand"></i>'
    showNotification("Đã tắt chế độ toàn màn hình", "info")
  }
}

// Setup all event listeners
function setupEventListeners() {
  // Play/Pause button
  playButton.addEventListener("click", () => {
    if (isPlaying) {
      pauseSong()
    } else {
      if (audioPlayer.src) {
        playSong()
      } else if (songs.length > 0) {
        playSongAtIndex(0)
      }
    }
  })

  // Play All button
  playAllButton.addEventListener("click", () => {
    if (isPlaying) {
      pauseSong()
    } else {
      if (songs.length > 0) {
        playSongAtIndex(0)
      }
    }
  })

  // Previous button
  prevButton.addEventListener("click", playPreviousSong)

  // Next button
  nextButton.addEventListener("click", playNextSong)

  // Shuffle button
  shuffleButton.addEventListener("click", toggleShuffle)

  // Repeat button
  repeatButton.addEventListener("click", toggleRepeat)

  // Like current song button
  likeCurrentButton.addEventListener("click", () => {
    if (songs[currentSongIndex]) {
      toggleLike(songs[currentSongIndex].id)
    }
  })

  // Mute button
  muteButton.addEventListener("click", toggleMute)

  // Progress bar events
  const progressContainer = progressBar.parentElement

  progressContainer.addEventListener("mousedown", (e) => {
    isDraggingProgress = true
    const rect = progressContainer.getBoundingClientRect()
    const percent = ((e.clientX - rect.left) / rect.width) * 100
    seekTo(percent)
  })

  progressContainer.addEventListener("touchstart", (e) => {
    isDraggingProgress = true
    const rect = progressContainer.getBoundingClientRect()
    const touch = e.touches[0]
    const percent = ((touch.clientX - rect.left) / rect.width) * 100
    seekTo(percent)
  })

  document.addEventListener("mousemove", (e) => {
    if (isDraggingProgress) {
      const rect = progressContainer.getBoundingClientRect()
      const percent = ((e.clientX - rect.left) / rect.width) * 100
      seekTo(Math.max(0, Math.min(100, percent)))
    }
  })

  document.addEventListener("touchmove", (e) => {
    if (isDraggingProgress) {
      e.preventDefault()
      const rect = progressContainer.getBoundingClientRect()
      const touch = e.touches[0]
      const percent = ((touch.clientX - rect.left) / rect.width) * 100
      seekTo(Math.max(0, Math.min(100, percent)))
    }
  })

  document.addEventListener("mouseup", () => {
    if (isDraggingProgress) {
      isDraggingProgress = false
      savePlayerState()
    }
  })

  document.addEventListener("touchend", () => {
    if (isDraggingProgress) {
      isDraggingProgress = false
      savePlayerState()
    }
  })

  // Volume slider events
  const volumeContainer = volumeBar.parentElement

  volumeContainer.addEventListener("mousedown", (e) => {
    isDraggingVolume = true
    const rect = volumeContainer.getBoundingClientRect()
    const percent = ((e.clientX - rect.left) / rect.width) * 100
    setVolume(percent)
  })

  volumeContainer.addEventListener("touchstart", (e) => {
    isDraggingVolume = true
    const rect = volumeContainer.getBoundingClientRect()
    const touch = e.touches[0]
    const percent = ((touch.clientX - rect.left) / rect.width) * 100
    setVolume(percent)
  })

  document.addEventListener("mousemove", (e) => {
    if (isDraggingVolume) {
      const rect = volumeContainer.getBoundingClientRect()
      const percent = ((e.clientX - rect.left) / rect.width) * 100
      setVolume(Math.max(0, Math.min(100, percent)))
    }
  })

  document.addEventListener("touchmove", (e) => {
    if (isDraggingVolume) {
      e.preventDefault()
      const rect = volumeContainer.getBoundingClientRect()
      const touch = e.touches[0]
      const percent = ((touch.clientX - rect.left) / rect.width) * 100
      setVolume(Math.max(0, Math.min(100, percent)))
    }
  })

  document.addEventListener("mouseup", () => {
    isDraggingVolume = false
  })

  document.addEventListener("touchend", () => {
    isDraggingVolume = false
  })

  // Audio player events
  audioPlayer.addEventListener("timeupdate", updateProgress)

  audioPlayer.addEventListener("ended", () => {
    switch (repeatMode) {
      case 0: // No repeat
        if (currentSongIndex < songs.length - 1) {
          playNextSong()
        } else {
          pauseSong()
          audioPlayer.currentTime = 0
          updateProgress()
        }
        break
      case 1: // Repeat all
        playNextSong()
        break
      case 2: // Repeat one
        audioPlayer.currentTime = 0
        playSong()
        break
    }
  })

  audioPlayer.addEventListener("loadedmetadata", () => {
    totalTimeDisplay.textContent = formatTime(audioPlayer.duration)
  })

  // Save player state periodically
  setInterval(savePlayerState, 5000)

  // Mobile sidebar toggle
  mobileSidebarToggle.addEventListener("click", toggleMobileSidebar)
  closeMobileSidebar.addEventListener("click", toggleMobileSidebar)

  // Lyrics modal
  lyricsButton.addEventListener("click", toggleLyricsModal)
  closeLyrics.addEventListener("click", toggleLyricsModal)

  // Navigation buttons
  backButton.addEventListener("click", navigateBack)
  forwardButton.addEventListener("click", navigateForward)

  // Fullscreen button
  fullscreenButton.addEventListener("click", toggleFullscreen)

  // Add search functionality
  const searchInput = document.getElementById("search-input")
  const searchButton = document.getElementById("search-button")

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchSongs(e.target.value)
    })

    // Clear search when pressing Escape
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        searchInput.value = ""
        searchSongs("")
      }

      // Search when pressing Enter
      if (e.key === "Enter") {
        searchSongs(searchInput.value)
        showNotification(`Đang tìm kiếm: ${searchInput.value}`, "info")
      }
    })
  }

  // Add search button click event
  if (searchButton) {
    searchButton.addEventListener("click", () => {
      if (searchInput) {
        searchSongs(searchInput.value)
        showNotification(`Đang tìm kiếm: ${searchInput.value}`, "info")

        // Add visual feedback
        searchButton.classList.add("scale-95")
        setTimeout(() => {
          searchButton.classList.remove("scale-95")
        }, 200)
      }
    })
  }

  // Current song title and artist click to show lyrics
  currentTitle.addEventListener("click", toggleLyricsModal)
  currentArtist.addEventListener("click", toggleLyricsModal)

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Ignore if focus is on an input element
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return
    }

    // Space: Play/Pause
    if (e.code === "Space") {
      e.preventDefault()
      if (isPlaying) {
        pauseSong()
      } else {
        playSong()
      }
    }

    // Left Arrow: Rewind 5 seconds
    if (e.code === "ArrowLeft") {
      audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 5)
    }

    // Right Arrow: Forward 5 seconds
    if (e.code === "ArrowRight") {
      audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 5)
    }

    // J: Previous song
    if (e.code === "KeyJ") {
      playPreviousSong()
    }

    // K: Play/Pause
    if (e.code === "KeyK") {
      if (isPlaying) {
        pauseSong()
      } else {
        playSong()
      }
    }

    // L: Next song
    if (e.code === "KeyL") {
      playNextSong()
    }

    // M: Mute/Unmute
    if (e.code === "KeyM") {
      toggleMute()
    }

    // F: Toggle fullscreen
    if (e.code === "KeyF") {
      toggleFullscreen()
    }
  })

  // Handle fullscreen change
  document.addEventListener("fullscreenchange", () => {
    isFullscreen = !!document.fullscreenElement
    fullscreenButton.innerHTML = isFullscreen
      ? '<i class="fa-solid fa-compress"></i>'
      : '<i class="fa-solid fa-expand"></i>'
  })

  // Add particle effect
  createParticleEffect()

  // Add button press effect
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("mousedown", () => {
      button.style.transform = "scale(0.95)"
    })

    button.addEventListener("mouseup", () => {
      button.style.transform = ""
    })

    button.addEventListener("mouseleave", () => {
      button.style.transform = ""
    })
  })
}

// Add this function at the end of the file, before the DOMContentLoaded event listener
function createParticleEffect() {
  const container = document.querySelector("main")
  if (!container) return

  const createParticle = () => {
    const particle = document.createElement("div")
    particle.classList.add("particle")

    // Random size between 2px and 6px
    const size = Math.random() * 4 + 2
    particle.style.width = `${size}px`
    particle.style.height = `${size}px`

    // Random position within the container
    const containerRect = container.getBoundingClientRect()
    const x = Math.random() * containerRect.width
    const y = Math.random() * containerRect.height

    particle.style.left = `${x}px`
    particle.style.top = `${y}px`

    // Random opacity
    particle.style.opacity = Math.random() * 0.5 + 0.1

    // Add to container
    container.appendChild(particle)

    // Animate upward and fade out
    const duration = Math.random() * 10000 + 5000 // 5-15 seconds
    const keyframes = [
      { transform: `translate(0, 0)`, opacity: particle.style.opacity },
      { transform: `translate(${Math.random() * 100 - 50}px, -${containerRect.height}px)`, opacity: 0 },
    ]

    const animation = particle.animate(keyframes, {
      duration,
      easing: "ease-out",
      fill: "forwards",
    })

    // Remove particle when animation completes
    animation.onfinish = () => {
      particle.remove()
      createParticle() // Create a new one to replace it
    }
  }

  // Create initial particles
  for (let i = 0; i < 15; i++) {
    createParticle()
  }
}

// Initialize player when DOM is loaded
document.addEventListener("DOMContentLoaded", initPlayer)
