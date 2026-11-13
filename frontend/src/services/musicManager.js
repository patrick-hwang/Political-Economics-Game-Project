// Background Music Manager for Asteria 1914: Wings of Capital
// Manages era-based music transitions, volume control, pause/resume for videos.

export const MUSIC_TRACKS = {
  HOME: encodeURI('/musics/Home - Wandering - Nat Keefe.mp3'),
  ERA_I_II: encodeURI('/musics/I - Duty Calls - Rod Kim.mp3'),
  ERA_III_IV: encodeURI('/musics/II - Standoff - Density & Time.mp3'),
  ERA_V_VI: encodeURI('/musics/III - Monthaholic - Schwartzy.mp3'),
  ERA_VII_VIII: encodeURI('/musics/IV - Garythargy - Schwartzy.mp3')
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

function getAudioElement() {
  if (!audioElement && typeof window !== 'undefined') {
    audioElement = new Audio();
    audioElement.loop = true;
    audioElement.volume = Math.max(0, Math.min(1, musicVolume / 100));

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
    audioElement.volume = clamped / 100;
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

  audio.volume = musicVolume / 100;
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
