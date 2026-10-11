import { useEffect, useId, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { ArrowCounterClockwise, Play, SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'
import type { Film } from '../content/site'
import './FilmPlayer.css'

type Props = {
  film: Film
  /** `city`: toned slate with a wine glow. `night`: letterboxed, a low wine horizon. */
  tone?: 'city' | 'night'
  /** Print the film title on the slate. Off where a heading beside it already says it. */
  slateTitle?: boolean
  /** False while the film sits in a hidden reel panel: it must not autoplay. */
  active?: boolean
  className?: string
}

type State = 'idle' | 'playing' | 'error'

const PLAY_EVENT = 'film:play'

/** Pause every film on the page (e.g. when a reel switches chapter). */
export function pauseAllFilms() {
  document.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: null }))
}

/** Add autoplay to an embed URL. Only ever called after the visitor presses play. */
function withAutoplay(src: string) {
  const url = new URL(src, window.location.href)
  url.searchParams.set('autoplay', '1')
  return url.toString()
}

/**
 * Light spill: the film's own colours, sampled a few times a second into a
 * tiny canvas that sits blurred behind the frame, so the screen lights the
 * page around it.
 */
function useLightSpill(videoRef: React.RefObject<HTMLVideoElement | null>, canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const v = videoRef.current
    const c = canvasRef.current
    const ctx = c?.getContext('2d', { willReadFrequently: false })
    if (!v || !c || !ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer = 0
    const paint = () => {
      if (v.readyState >= 2) {
        try {
          ctx.drawImage(v, 0, 0, c.width, c.height)
        } catch {
          /* cross-origin or not ready: keep the last frame */
        }
      }
    }
    const startLoop = () => {
      window.clearInterval(timer)
      paint()
      timer = window.setInterval(paint, 120)
    }
    const stopLoop = () => window.clearInterval(timer)
    v.addEventListener('playing', startLoop)
    v.addEventListener('pause', stopLoop)
    v.addEventListener('ended', stopLoop)
    v.addEventListener('seeked', paint)
    return () => {
      stopLoop()
      v.removeEventListener('playing', startLoop)
      v.removeEventListener('pause', stopLoop)
      v.removeEventListener('ended', stopLoop)
      v.removeEventListener('seeked', paint)
    }
  }, [videoRef, canvasRef])
}

/**
 * A film frame that never shows a broken player.
 *  • No source → an intentional "coming soon" title card.
 *  • Source    → poster and play control. Pressing play starts the film from
 *                the beginning WITH sound.
 *  • Autoplay  → starts muted and looping once on screen (and active); pauses
 *                off screen. A "Sound on" control restarts it with sound.
 *                Reduced-motion visitors get the poster and play button.
 *  • Failure   → an inline message with a retry.
 * Starting one film pauses any other film on the page, so only one is ever heard.
 */
export function FilmPlayer({ film, tone = 'city', slateTitle = true, active = true, className = '' }: Props) {
  const [state, setState] = useState<State>('idle')
  const [muted, setMuted] = useState(true)
  const stateRef = useRef<State>('idle')
  stateRef.current = state
  const videoRef = useRef<HTMLVideoElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const spillRef = useRef<HTMLCanvasElement>(null)
  const titleId = useId()
  useLightSpill(videoRef, spillRef)

  // True when playback was started by scrolling into view, not by the visitor.
  const ambient = useRef(false)
  // Set just before the page itself pauses the video (scroll-out, another film).
  const systemPause = useRef(false)
  const pauseBySystem = () => {
    const v = videoRef.current
    if (v && !v.paused) {
      systemPause.current = true
      v.pause()
    }
  }

  const { source, poster } = film
  const isFile = source?.kind === 'file'
  const autoplay =
    Boolean(film.autoplay) &&
    isFile &&
    typeof window !== 'undefined' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Muted must be set as a property before any play() for browsers to allow autoplay.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.defaultMuted = true
  }, [])

  const inView = useRef(false)
  const activeRef = useRef(active)
  // Start (or resume) the silent loop if the film is on screen and active.
  const tryAmbient = () => {
    if (!autoplay || !inView.current || !activeRef.current) return
    const v = videoRef.current
    if (!v) return
    if (stateRef.current === 'idle') {
      ambient.current = true
      v.muted = true
      v.preload = 'auto'
      v.play()
        .then(() => setState('playing'))
        .catch(() => {})
    } else if (ambient.current && v.paused) {
      v.play().catch(() => {})
    }
  }

  // Autoplay: play muted while at least 40% of the frame is visible.
  useEffect(() => {
    const frame = frameRef.current
    if (!autoplay || !frame) return
    const io = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting
        if (entry.isIntersecting) tryAmbient()
        else pauseBySystem()
      },
      { threshold: 0.4 },
    )
    io.observe(frame)
    return () => io.disconnect()
  }, [autoplay])

  // A reel panel becoming active starts its loop; becoming hidden pauses it.
  useEffect(() => {
    activeRef.current = active
    if (active) tryAmbient()
    else pauseBySystem()
  }, [active])

  // Another film started: stop this one, and drop its sound so it never resumes loud.
  useEffect(() => {
    const onPlay = (e: Event) => {
      if ((e as CustomEvent<string>).detail === film.id) return
      pauseBySystem()
      const v = videoRef.current
      if (v && !v.muted) {
        v.muted = true
        ambient.current = false
      }
    }
    document.addEventListener(PLAY_EVENT, onPlay)
    return () => document.removeEventListener(PLAY_EVENT, onPlay)
  }, [film.id])

  // Keep keyboard users in place: focus moves into an embed once it mounts.
  useEffect(() => {
    if (state !== 'playing' || ambient.current || isFile) return
    frameRef.current?.querySelector('iframe')?.focus({ preventScroll: true })
  }, [state, isFile])

  /** The visitor asked for the film: from the start, with sound. */
  const start = () => {
    ambient.current = false
    document.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: film.id }))
    const v = videoRef.current
    if (source?.kind === 'file' && v) {
      if (state === 'error') v.load()
      // All of this runs inside the click, so the browser allows sound.
      v.muted = false
      v.volume = 1
      v.currentTime = source.start ?? 0
      v.play()
        .then(() => v.focus({ preventScroll: true }))
        .catch(() => {
          // Sound refused by the browser: still play, muted, and offer the control.
          v.muted = true
          v.play().catch(() => setState('error'))
        })
    }
    setState('playing')
  }

  const toggleSound = () => {
    const v = videoRef.current
    if (!v) return
    if (v.muted) start()
    else v.muted = true
  }

  // Edge light: follows the pointer around the frame.
  const onPointerMove = (e: RPointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--px', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--py', `${e.clientY - r.top}px`)
  }

  const hasSource = Boolean(source?.src)
  const playing = state === 'playing'

  return (
    <figure
      className={`film film--${tone} ${className}`}
      data-state={state}
      data-sound={playing && !muted ? '' : undefined}
      aria-labelledby={titleId}
      onPointerMove={onPointerMove}
    >
      <canvas ref={spillRef} className="film__spill" width={48} height={27} aria-hidden />
      <div className="film__frame" ref={frameRef}>
        {source?.kind === 'file' && (
          <video
            ref={videoRef}
            className="film__media"
            controls={playing}
            loop={autoplay}
            playsInline
            preload="none"
            poster={poster?.src}
            onLoadedMetadata={(e) => {
              if (source.start && e.currentTarget.currentTime < source.start) e.currentTarget.currentTime = source.start
            }}
            onTimeUpdate={(e) => {
              if (source.end && e.currentTarget.currentTime >= source.end) e.currentTarget.pause()
            }}
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            onError={() => setState('error')}
            // A visitor pressing pause takes over from the ambient loop.
            onPause={() => {
              if (!systemPause.current) ambient.current = false
              systemPause.current = false
            }}
            aria-label={film.title}
            tabIndex={playing ? 0 : -1}
          >
            <source src={source.src} type={source.type} />
            {film.captions && (
              <track
                kind="captions"
                src={film.captions.src}
                label={film.captions.label}
                srcLang={film.captions.srclang}
                default
              />
            )}
          </video>
        )}

        {playing && source?.kind === 'embed' && (
          <iframe
            className="film__media"
            src={withAutoplay(source.src)}
            title={film.title}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}

        {/* The poster stays mounted and fades away when the film starts. */}
        <div className="film__poster" aria-hidden={playing || undefined}>
          {poster ? (
            <picture>
              {poster.avif && <source srcSet={poster.avif} type="image/avif" />}
              {poster.webp && <source srcSet={poster.webp} type="image/webp" />}
              <img
                className="film__poster-img"
                src={poster.src}
                alt={poster.alt}
                loading="lazy"
                decoding="async"
                style={{
                  opacity: poster.opacity ?? 0.55,
                  objectPosition: poster.position,
                }}
              />
            </picture>
          ) : (
            <div className="film__slate" aria-hidden />
          )}

          <div className="film__card">
            {slateTitle && <p className="film__title display display--s">{film.title}</p>}

            {hasSource && state !== 'error' && (
              <button type="button" className="film__play" onClick={start} tabIndex={playing ? -1 : 0}>
                <span className="film__ring" aria-hidden>
                  <Play weight="fill" />
                </span>
                <span className="film__play-label micro">
                  <span aria-hidden>Play with sound</span>
                  <span className="sr-only">Play film with sound: {film.title}</span>
                  {film.duration && (
                    <span className="film__duration">
                      <span className="sr-only">, running time </span>
                      {film.duration}
                    </span>
                  )}
                </span>
              </button>
            )}

            {!hasSource && (
              <p className="film__soon">
                <span className="film__soon-line" aria-hidden />
                <span className="micro">Film coming soon</span>
              </p>
            )}
          </div>
        </div>

        {/* Sound: obvious while a film plays silently, quiet once it is on. */}
        {playing && isFile && (
          <button
            type="button"
            className="film__sound micro"
            data-muted={muted || undefined}
            onClick={toggleSound}
            aria-label={muted ? `Play ${film.title} from the start with sound` : `Mute ${film.title}`}
          >
            {muted ? <SpeakerSlash weight="fill" aria-hidden /> : <SpeakerHigh weight="fill" aria-hidden />}
            <span aria-hidden>{muted ? 'Tap for sound' : 'Sound on'}</span>
          </button>
        )}

        <span className="film__edge" aria-hidden />

        {state === 'error' && (
          <div className="film__error" role="alert">
            <p>This film couldn’t be loaded.</p>
            <button type="button" className="film__retry micro" onClick={start}>
              <ArrowCounterClockwise aria-hidden /> Try again
            </button>
          </div>
        )}
      </div>

      <figcaption className="sr-only" id={titleId}>
        {film.title}
      </figcaption>
    </figure>
  )
}
