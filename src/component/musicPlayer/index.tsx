import { useRef, useState } from "react"
import {
  WEDDING_MUSIC_ARTIST,
  WEDDING_MUSIC_FILE,
  WEDDING_MUSIC_LICENSE_URL,
  WEDDING_MUSIC_SOURCE_URL,
  WEDDING_MUSIC_TITLE,
} from "../../const"

/**
 * 방문자가 직접 켜고 끌 수 있는 배경 음악 버튼입니다.
 * 음원 파일이 설정되지 않았다면 아무 UI도 표시하지 않습니다.
 */
export const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)

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
        preload="metadata"
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

/** 무료 음원의 저작자, 원본, 이용 허락과 변환 사실을 표시합니다. */
export const MusicCredit = () => {
  if (!WEDDING_MUSIC_FILE) return null

  return (
    <p className="music-credit">
      음악:{" "}
      <a
        href={WEDDING_MUSIC_SOURCE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        {WEDDING_MUSIC_TITLE} — {WEDDING_MUSIC_ARTIST}
      </a>
      {" · "}
      <a
        href={WEDDING_MUSIC_LICENSE_URL}
        target="_blank"
        rel="noopener noreferrer"
      >
        CC BY 4.0
      </a>
      {" · 모바일용 MP3로 재인코딩"}
    </p>
  )
}
