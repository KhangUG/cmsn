const SESSION_ON = 'birthday-sound-on'
const SESSION_VOLUME = 'birthday-sound-volume'

const CHORDS = [
  [130.81, 164.81, 196.0],
  [110.0, 130.81, 164.81],
  [87.31, 130.81, 174.61],
  [98.0, 123.47, 196.0],
]

export function readSoundPreference() {
  try {
    return sessionStorage.getItem(SESSION_ON) === '1'
  } catch {
    return false
  }
}

export function readVolumePreference(fallback: number) {
  try {
    const raw = sessionStorage.getItem(SESSION_VOLUME)
    if (!raw) return fallback
    const value = Number(raw)
    if (Number.isNaN(value)) return fallback
    return Math.min(1, Math.max(0, value))
  } catch {
    return fallback
  }
}

function writePreference(on: boolean, volume: number) {
  try {
    sessionStorage.setItem(SESSION_ON, on ? '1' : '0')
    sessionStorage.setItem(SESSION_VOLUME, String(volume))
  } catch {
    /* private mode */
  }
}

const soundListeners = new Set<() => void>()

export function subscribeSound(listener: () => void) {
  soundListeners.add(listener)
  return () => {
    soundListeners.delete(listener)
  }
}

function emitSound() {
  soundListeners.forEach((listener) => listener())
}

export function soundWasMuted() {
  try {
    return sessionStorage.getItem(SESSION_ON) === '0'
  } catch {
    return false
  }
}

class Soundscape {
  private context: AudioContext | null = null
  private musicGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private voices: Array<{ osc: OscillatorNode; gain: GainNode }> = []
  private filter: BiquadFilterNode | null = null
  private audio: HTMLAudioElement | null = null
  private usingFile = false
  private chordTimer = 0
  private chordIndex = 0
  private fadeFrame = 0
  private noise: AudioBuffer | null = null
  volume = 0.42
  enabled = false

  private ensure() {
    if (this.context) return
    const Context = window.AudioContext
    this.context = new Context()
    this.musicGain = this.context.createGain()
    this.sfxGain = this.context.createGain()
    this.musicGain.gain.value = this.volume
    this.sfxGain.gain.value = Math.min(1, this.volume * 1.15)
    this.musicGain.connect(this.context.destination)
    this.sfxGain.connect(this.context.destination)
    const duration = 0.7
    this.noise = this.context.createBuffer(1, Math.floor(this.context.sampleRate * duration), this.context.sampleRate)
    const data = this.noise.getChannelData(0)
    for (let index = 0; index < data.length; index += 1) {
      const fade = 1 - index / data.length
      data[index] = (Math.random() * 2 - 1) * fade * fade
    }
  }

  setVolume(value: number) {
    this.volume = Math.min(1, Math.max(0, value))
    if (this.musicGain) this.musicGain.gain.value = this.volume
    if (this.sfxGain) this.sfxGain.gain.value = Math.min(1, this.volume * 1.15)
    if (this.audio) this.audio.volume = this.volume
    try {
      sessionStorage.setItem(SESSION_VOLUME, String(this.volume))
    } catch {
      /* private mode */
    }
  }

  private fadeTrack(to: number, seconds: number, pauseAtEnd = false) {
    const audio = this.audio
    if (!audio) return
    cancelAnimationFrame(this.fadeFrame)
    const from = audio.volume
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / Math.max(seconds * 1000, 1))
      audio.volume = from + (to - from) * t
      if (t < 1) this.fadeFrame = requestAnimationFrame(step)
      else if (pauseAtEnd) audio.pause()
    }
    this.fadeFrame = requestAnimationFrame(step)
  }

  async enable(src: string) {
    this.ensure()
    this.enabled = true
    writePreference(true, this.volume)
    emitSound()
    const context = this.context
    if (!context) return
    const resume = context.resume()

    if (src && !this.usingFile) {
      if (!this.audio) {
        this.audio = new Audio(src)
        this.audio.loop = true
        this.audio.preload = 'auto'
      }
      this.audio.volume = 0
      try {
        await this.audio.play()
        this.usingFile = true
        this.stopPad()
        this.fadeTrack(this.volume, 1.4)
        return
      } catch {
        this.usingFile = false
      }
    } else if (this.usingFile && this.audio) {
      try {
        if (this.audio.paused) {
          this.audio.volume = 0
          await this.audio.play()
          this.fadeTrack(this.volume, 0.8)
        }
        return
      } catch {
        this.usingFile = false
      }
    }

    await resume
    this.startPad()
  }

  disable() {
    this.enabled = false
    writePreference(false, this.volume)
    emitSound()
    if (this.audio && !this.audio.paused) this.fadeTrack(0, 0.6, true)
    else this.audio?.pause()
    this.stopPad()
  }

  private startPad() {
    const context = this.context
    const musicGain = this.musicGain
    if (!context || !musicGain || this.voices.length > 0) return
    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 720
    filter.Q.value = 0.4
    filter.connect(musicGain)
    this.filter = filter
    const now = context.currentTime
    CHORDS[0].forEach((frequency, index) => {
      const osc = context.createOscillator()
      const gain = context.createGain()
      osc.type = 'sine'
      osc.frequency.value = frequency
      osc.detune.value = (index - 1) * 6
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.03, now + 1.6)
      osc.connect(gain)
      gain.connect(filter)
      osc.start()
      this.voices.push({ osc, gain })
    })
    this.chordTimer = window.setInterval(() => this.nextChord(), 9000)
  }

  private nextChord() {
    const context = this.context
    if (!context || this.voices.length === 0) return
    this.chordIndex = (this.chordIndex + 1) % CHORDS.length
    const chord = CHORDS[this.chordIndex]
    const when = context.currentTime + 2.4
    this.voices.forEach((voice, index) => {
      voice.osc.frequency.linearRampToValueAtTime(chord[index] ?? chord[0], when)
    })
    if (this.filter) {
      const brightness = 640 + (this.chordIndex % 2) * 160
      this.filter.frequency.linearRampToValueAtTime(brightness, when)
    }
  }

  private stopPad() {
    window.clearInterval(this.chordTimer)
    this.chordTimer = 0
    const context = this.context
    const when = context ? context.currentTime : 0
    for (const voice of this.voices) {
      try {
        voice.gain.gain.cancelScheduledValues(when)
        voice.gain.gain.setValueAtTime(voice.gain.gain.value, when)
        voice.gain.gain.linearRampToValueAtTime(0.0001, when + 0.4)
        voice.osc.stop(when + 0.45)
      } catch {
        /* already stopped */
      }
    }
    this.voices = []
    this.filter = null
  }

  private tone(frequency: number, at: number, duration: number, amount: number) {
    if (!this.enabled || !this.context || !this.sfxGain) return
    const osc = this.context.createOscillator()
    const gain = this.context.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, amount), at + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)
    osc.connect(gain)
    gain.connect(this.sfxGain)
    osc.start(at)
    osc.stop(at + duration + 0.02)
  }

  chime() {
    if (!this.context || !this.enabled) return
    const start = this.context.currentTime + 0.01
    this.tone(523.25, start, 0.7, 0.045)
    this.tone(659.25, start + 0.12, 0.8, 0.04)
    this.tone(783.99, start + 0.24, 0.95, 0.035)
    this.tone(1046.5, start + 0.38, 1.15, 0.028)
  }

  sparkle() {
    if (!this.context || !this.enabled) return
    const start = this.context.currentTime + 0.01
    ;[988, 1175, 1319, 1568].forEach((frequency, index) => {
      this.tone(frequency, start + index * 0.07, 0.42, 0.03)
    })
  }

  whoosh() {
    if (!this.context || !this.sfxGain || !this.noise || !this.enabled) return
    const source = this.context.createBufferSource()
    source.buffer = this.noise
    const filter = this.context.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(400, this.context.currentTime)
    filter.frequency.exponentialRampToValueAtTime(1400, this.context.currentTime + 0.45)
    filter.Q.value = 0.7
    const gain = this.context.createGain()
    gain.gain.setValueAtTime(0.0001, this.context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.12, this.context.currentTime + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.0001, this.context.currentTime + 0.7)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfxGain)
    source.start()
    source.stop(this.context.currentTime + 0.72)
  }
}

export const soundscape = new Soundscape()
