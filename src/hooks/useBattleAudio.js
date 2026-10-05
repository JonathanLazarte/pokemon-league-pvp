import { useEffect, useRef } from 'react';

/**
 * Custom hook to safely play background battle music without recreating Audio objects on every render.
 */
export const useBattleAudio = (audioUrl = 'https://github.com/jonylazarte/resources/raw/refs/heads/main/wild_4.ogg', volume = 0.4) => {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.volume = volume;
    audioRef.current = audio;

    const handleEnded = () => {
      audio.play().catch(() => {});
    };

    audio.addEventListener('ended', handleEnded);
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      audioRef.current = null;
    };
  }, [audioUrl, volume]);

  const playSound = (soundUrl, soundVolume = 0.5) => {
    if (!soundUrl) return;
    const sound = new Audio(soundUrl);
    sound.volume = soundVolume;
    sound.play().catch(() => {});
  };

  return {
    audioRef,
    playSound,
  };
};

export default useBattleAudio;
