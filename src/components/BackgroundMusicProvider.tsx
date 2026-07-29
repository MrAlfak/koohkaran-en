import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { img } from "../utils";

type BackgroundMusicContextValue = {
  muted: boolean;
  toggleMute: () => void;
};

const BackgroundMusicContext = createContext<BackgroundMusicContextValue>({
  muted: false,
  toggleMute: () => {},
});

export function useBackgroundMusic() {
  return useContext(BackgroundMusicContext);
}

export function BackgroundMusicProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const startedRef = useRef(false);
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem("koohkaran-mute") === "1";
    } catch {
      return false;
    }
  });

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || muted) return;
    try {
      await audio.play();
      startedRef.current = true;
    } catch {
      /* blocked until user interaction */
    }
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = true;
    audio.volume = 0.3;
    audio.muted = muted;
    if (!muted) tryPlay();
  }, [muted, tryPlay]);

  useEffect(() => {
    const startOnInteraction = () => {
      tryPlay();
    };
    window.addEventListener("pointerdown", startOnInteraction);
    window.addEventListener("keydown", startOnInteraction);
    return () => {
      window.removeEventListener("pointerdown", startOnInteraction);
      window.removeEventListener("keydown", startOnInteraction);
    };
  }, [tryPlay]);

  const toggleMute = () => {
    setMuted(prev => {
      const next = !prev;
      try {
        localStorage.setItem("koohkaran-mute", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      const audio = audioRef.current;
      if (audio) {
        audio.muted = next;
        if (!next) tryPlay();
      }
      return next;
    });
  };

  return (
    <BackgroundMusicContext.Provider value={{ muted, toggleMute }}>
      <audio ref={audioRef} src={img("audio/background.mp3")} preload="auto" />
      {children}
    </BackgroundMusicContext.Provider>
  );
}
