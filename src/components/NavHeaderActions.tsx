import { useBackgroundMusic } from "./BackgroundMusicProvider";

type Tone = "hero" | "default" | "filled";

function MuteIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M11 5L6 9H3v6h3l5 4V5z" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M11 5L6 9H3v6h3l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function getStyles(tone: Tone, scrolled: boolean) {
  if (tone === "filled") {
    return {
      mute: {
        border: "1px solid #1c1917",
        color: "#1c1917",
        background: "transparent",
      },
      contact: {
        border: "1px solid #1c1917",
        color: "#fff",
        background: "#1c1917",
      },
    };
  }

  if (tone === "hero" && !scrolled) {
    return {
      mute: {
        border: "1px solid rgba(255,255,255,0.75)",
        color: "#fff",
        background: "transparent",
      },
      contact: {
        border: "1px solid rgba(255,255,255,0.75)",
        color: "#fff",
        background: "transparent",
      },
    };
  }

  return {
    mute: {
      border: "1px solid #292524",
      color: "#292524",
      background: "transparent",
    },
    contact: {
      border: "1px solid #292524",
      color: "#292524",
      background: "transparent",
    },
  };
}

export default function NavHeaderActions({
  onContact,
  tone = "default",
  scrolled = true,
}: {
  onContact: () => void;
  tone?: Tone;
  scrolled?: boolean;
}) {
  const { muted, toggleMute } = useBackgroundMusic();
  const styles = getStyles(tone, scrolled);
  const btnBase: React.CSSProperties = {
    fontSize: 13,
    letterSpacing: "0.05em",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .3s",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div className="nav-header-actions" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        type="button"
        className="nav-mute-btn"
        onClick={toggleMute}
        aria-label={muted ? "Unmute background music" : "Mute background music"}
        title={muted ? "Unmute music" : "Mute music"}
        style={{
          ...btnBase,
          width: 40,
          height: 40,
          padding: 0,
          borderRadius: "50%",
          ...styles.mute,
        }}
      >
        <MuteIcon muted={muted} />
      </button>
      <button
        type="button"
        className="nav-cta-btn"
        onClick={onContact}
        style={{
          ...btnBase,
          padding: "10px 26px",
          ...styles.contact,
        }}
      >
        Contact Us
      </button>
    </div>
  );
}
