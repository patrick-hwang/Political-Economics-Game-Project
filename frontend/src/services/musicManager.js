// Background Music Manager for Asteria 1914: Wings of Capital
// Manages era-based music transitions, volume control, pause/resume for videos.

export const MUSIC_TRACKS = {
  HOME: encodeURI('/musics/Home - Wandering - Nat Keefe.mp3'),
  ERA_I_II: encodeURI('/musics/I - Taking Chances - The Soundings.mp3'),
  ERA_III_IV: encodeURI('/musics/II - Standoff - Density & Time.mp3'),
  ERA_V_VI: encodeURI('/musics/III - Floating Lanterns - The Mini Vandals.mp3'),
  ERA_VII_VIII: encodeURI('/musics/IV - Sands of time - Patrick Patrikios.mp3')
};

let audioElement = null;
let currentTrack = null;
let isExplicitlyPausedForVideo = false;

// Initialize volume from localStorage or default to 60%
let musicVolume = (() => {
  try {
    const saved = localStorage.getItem('asteria_music_volume');
    if (saved !== null) {
      const parsed = Number(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) return parsed;
    }
  } catch (e) {}
  return 60;
})();

// Hệ số âm lượng riêng cho từng bài (Track Gain):
// - Nhạc Home: 75% (gain = 0.75)
// - Nhạc I (Kỷ nguyên I, II): 65% (gain = 0.65)
// - Nhạc II (Kỷ nguyên III, IV): 85% (gain = 0.85)
// - Các nhạc còn lại (III, IV): 100% (gain = 1.0)
export function getTrackGain(trackUrl) {
  if (!trackUrl) return 1.0;
  const decoded = decodeURI(trackUrl);
  // if (decoded.includes('Home') || trackUrl === MUSIC_TRACKS.HOME) {
  //   return 0.75;
  // }
  // if (
  //   decoded.includes('Duty Calls') || 
  //   decoded.includes('/musics/I ') || 
  //   trackUrl === MUSIC_TRACKS.ERA_I_II
  // ) {
  //   return 0.50;
  // }
  // if (
  //   decoded.includes('Standoff') || 
  //   decoded.includes('/musics/II ') || 
  //   trackUrl === MUSIC_TRACKS.ERA_III_IV
  // ) {
  //   return 0.85;
  // }
  return 1.0;
}

export function getEffectiveVolume(trackUrl = currentTrack) {
  const base = musicVolume / 100;
  const gain = getTrackGain(trackUrl);
  return Math.max(0, Math.min(1, base * gain));
}

function getAudioElement() {
  if (!audioElement && typeof window !== 'undefined') {
    audioElement = new Audio();
    audioElement.loop = true;
    audioElement.volume = getEffectiveVolume(currentTrack);

    // Handle user interaction for browser autoplay policy unlock
    const unlockAutoplay = () => {
      if (audioElement && currentTrack && audioElement.paused && !isExplicitlyPausedForVideo) {
        audioElement.play().catch(() => {});
      }
      window.removeEventListener('click', unlockAutoplay);
      window.removeEventListener('keydown', unlockAutoplay);
      window.removeEventListener('touchstart', unlockAutoplay);
    };

    window.addEventListener('click', unlockAutoplay);
    window.addEventListener('keydown', unlockAutoplay);
    window.addEventListener('touchstart', unlockAutoplay);
  }
  return audioElement;
}

export function getMusicVolume() {
  return musicVolume;
}

export function setMusicVolume(vol) {
  const clamped = Math.max(0, Math.min(100, Math.round(vol)));
  musicVolume = clamped;
  try {
    localStorage.setItem('asteria_music_volume', String(clamped));
  } catch (e) {}

  if (audioElement) {
    audioElement.volume = getEffectiveVolume(currentTrack);
  }
}

export function playTrack(trackUrl) {
  if (!trackUrl) return;
  const audio = getAudioElement();
  if (!audio) return;

  if (currentTrack === trackUrl && !audio.paused) {
    return; // Already playing this track
  }

  currentTrack = trackUrl;
  isExplicitlyPausedForVideo = false;

  if (audio.src !== trackUrl && !audio.src.endsWith(trackUrl)) {
    audio.src = trackUrl;
    audio.currentTime = 0;
  }

  audio.volume = getEffectiveVolume(trackUrl);
  const promise = audio.play();
  if (promise !== undefined) {
    promise.catch(() => {
      // Browser blocked autoplay before user interaction; will unlock on first click
    });
  }
}

export function pauseMusic() {
  isExplicitlyPausedForVideo = true;
  if (audioElement && !audioElement.paused) {
    audioElement.pause();
  }
}

export function resumeMusic() {
  isExplicitlyPausedForVideo = false;
  if (audioElement && currentTrack) {
    audioElement.volume = musicVolume / 100;
    audioElement.play().catch(() => {});
  }
}

export function stopMusic() {
  if (audioElement) {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
  currentTrack = null;
  isExplicitlyPausedForVideo = false;
}
