"use client"
import { useEffect, useRef, useState } from "react"

export default function MusicPlayer({ musicUrl }: { musicUrl: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.loop = true
    audio.volume = 0.5

    const tryPlay = () => {
      audio.play()
        .then(() => setPlaying(true))
        .catch(() => {})
      document.removeEventListener("touchstart", tryPlay)
      document.removeEventListener("click", tryPlay)
      document.removeEventListener("scroll", tryPlay)
    }

    audio.play()
      .then(() => setPlaying(true))
      .catch(() => {
        document.addEventListener("touchstart", tryPlay, { once: true })
        document.addEventListener("click", tryPlay, { once: true })
        document.addEventListener("scroll", tryPlay, { once: true })
      })

    return () => {
      audio.pause()
      document.removeEventListener("touchstart", tryPlay)
      document.removeEventListener("click", tryPlay)
      document.removeEventListener("scroll", tryPlay)
    }
  }, [musicUrl])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  if (!musicUrl) return null

  return (
    <>
      <audio ref={audioRef} src={musicUrl} preload="auto" />

      <button
        onClick={togglePlay}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 38,
          height: 38,
          borderRadius: "50%",
          background: "rgba(44,44,42,0.88)",
          border: "1px solid rgba(184,150,90,0.5)",
          color: "#e8d5a3",
          fontSize: 16,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
          transition: "all 0.2s"
        }}
        title={playing ? "Pause musik" : "Play musik"}
      >
        {playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
            <rect x="5" y="4" width="4" height="16" rx="1" />
            <rect x="15" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
            <polygon points="6,4 20,12 6,20" />
          </svg>
        )}
      </button>

      {playing && (
        <div style={{
          position: "fixed",
          bottom: 80,
          right: 20,
          background: "rgba(44,44,42,0.78)",
          border: "1px solid rgba(184,150,90,0.3)",
          padding: "4px 12px",
          borderRadius: 20,
          zIndex: 999,
          backdropFilter: "blur(8px)"
        }}>
          <p style={{
            fontSize: 9,
            color: "#b8965a",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 5,
            margin: 0
          }}>
            <span className="music-pulse">♪</span>
            Playing
          </p>
        </div>
      )}

      <style>{`
        .music-pulse {
          animation: musicPulse 1.2s ease-in-out infinite;
          display: inline-block;
        }
        @keyframes musicPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }
      `}</style>
    </>
  )
}