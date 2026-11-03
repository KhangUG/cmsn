import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { birthdayConfig } from '../config/birthday.ts'
import { readSoundPreference, readVolumePreference, soundscape, subscribeSound } from '../experience/audio.ts'

export function AudioController() {
  const [on, setOn] = useState(false)
  const [volume, setVolume] = useState(() => readVolumePreference(birthdayConfig.music.volume))

  useEffect(() => {
    soundscape.setVolume(volume)
  }, [volume])

  useEffect(() => subscribeSound(() => setOn(soundscape.enabled)), [])

  useEffect(() => {
    if (!readSoundPreference()) return
    setOn(true)
    const start = () => {
      void soundscape.enable(birthdayConfig.music.src)
      window.removeEventListener('pointerdown', start)
    }
    window.addEventListener('pointerdown', start)
    return () => window.removeEventListener('pointerdown', start)
  }, [])

  function toggle() {
    if (!soundscape.enabled) {
      void soundscape.enable(birthdayConfig.music.src)
      setOn(true)
      return
    }
    soundscape.disable()
    setOn(false)
  }

  function changeVolume(event: ChangeEvent<HTMLInputElement>) {
    const next = Number(event.target.value)
    setVolume(next)
    soundscape.setVolume(next)
  }

  return (
    <div className="audio-dock">
      <button
        type="button"
        className={on ? 'sound-toggle is-on' : 'sound-toggle'}
        aria-pressed={on}
        aria-label={on ? 'Tắt nhạc' : 'Bật nhạc'}
        onClick={(event) => {
          event.stopPropagation()
          toggle()
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 10h3.2L12 6.2v11.6L7.2 14H4v-4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {on ? (
            <path
              d="M15.5 9.2a3.4 3.4 0 0 1 0 5.6M17.8 7a6 6 0 0 1 0 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ) : (
            <path d="M16 10l4 4m0-4l-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          )}
        </svg>
        <span>{on ? 'Đang phát' : 'Nhạc'}</span>
      </button>
      {on ? (
        <label className="volume">
          <span className="sr-only">Âm lượng</span>
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={changeVolume} />
        </label>
      ) : null}
    </div>
  )
}
