import { useEffect, useRef, useState } from "react"
import { WEDDING_MUSIC_FILE, WEDDING_MUSIC_TITLE } from "../../const"

/**
 * 자동재생을 시도하고 방문자가 직접 켜고 끌 수 있는 배경 음악입니다.
 * 음원 파일이 설정되지 않았다면 아무 UI도 표시하지 않습니다.
 */
export const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !WEDDING_MUSIC_FILE) return

    // 자동재생이 차단된 환경에서는 첫 클릭/키보드 입력 때 한 번 더 시도합니다.
    // 재생 성공 또는 음악 버튼 조작 후에는 자동 시작을 해제해 일시정지를 존중합니다.
    const clearGestureListeners = () => {
      document.removeEventListener("click", startOnGesture, true)
      document.removeEventListener("keydown", startOnGesture, true)
    }
    const startOnGesture = (event: Event) => {
      if (!event.isTrusted) return
      if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") return
      clearGestureListeners()
      if (event.target instanceof Element && event.target.closest(".music-player")) return
      void audio.play().catch(() => {
        // 브라우저 정책 차단은 음원 오류가 아니므로 재생 버튼을 그대로 유지합니다.
      })
    }

    document.addEventListener("click", startOnGesture, true)
    document.addEventListener("keydown", startOnGesture, true)
    audio.addEventListener("play", clearGestureListeners)
    void audio.play().catch(() => {
      // 자동재생이 허용되지 않으면 첫 사용자 입력을 기다립니다.
    })

    return () => {
      clearGestureListeners()
      audio.removeEventListener("play", clearGestureListeners)
    }
  }, [])

  if (!WEDDING_MUSIC_FILE) return null

  const musicUrl = `${import.meta.env.BASE_URL}music/${encodeURIComponent(WEDDING_MUSIC_FILE)}`

  const togglePlayback = () => {
    const audio = audioRef.current
    if (!audio) return

    if (!audio.paused) {
      audio.pause()
      return
    }

    setHasError(false)
    // 모바일 브라우저에서는 사용자 클릭 안에서 바로 play()를 호출해야 합니다.
    void audio.play().catch(() => {
      setIsPlaying(false)
      setHasError(true)
    })
  }

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        src={musicUrl}
        loop
        autoPlay
        preload="auto"
        onPlay={() => {
          setIsPlaying(true)
          setHasError(false)
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false)
          setHasError(true)
        }}
      />
      <button
        type="button"
        className="music-player__button"
        onClick={togglePlayback}
        aria-label={
          hasError
            ? `${WEDDING_MUSIC_TITLE}을(를) 재생하지 못했습니다. 다시 시도`
            : `${WEDDING_MUSIC_TITLE} ${isPlaying ? "일시정지" : "재생"}`
        }
        title={WEDDING_MUSIC_TITLE}
      >
        <span className="music-player__symbol" aria-hidden="true">
          {isPlaying ? "Ⅱ" : "♪"}
        </span>
        <span>
          {hasError ? "재생 오류" : isPlaying ? "일시정지" : "음악 재생"}
        </span>
      </button>
    </div>
  )
}
