import { useEffect, useId, useRef, useState } from 'react'
import { ArrowCounterClockwise, Play } from '@phosphor-icons/react'
import type { Film } from '../content/site'
import './FilmPlayer.css'

type Props = {
  film: Film
  /** `city`: toned city-light slate. `night`: letterboxed, a low wine horizon. */
  tone?: 'city' | 'night'
  /** Print the film title on the slate. Off where a heading beside it already says it. */
  slateTitle?: boolean
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
 * A film frame that never shows a broken player.
 *  • No source → an intentional "coming soon" title card.
 *  • Source    → poster and play control. Nothing loads until the visitor
 *                presses play, and nothing ever plays with sound on its own.
 *  • Failure   → an inline message with a retry.
 * Starting one film pauses any other film on the page.
 */
export function FilmPlayer({ film, tone = 'city', slateTitle = true, className = '' }: Props) {
  const [state, setState] = useState<State>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const titleId = useId()

  useEffect(() => {
    const onPlay = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== film.id) videoRef.current?.pause()
    }
    document.addEventListener(PLAY_EVENT, onPlay)
    return () => document.removeEventListener(PLAY_EVENT, onPlay)
  }, [film.id])

  // Keep keyboard users in place: focus moves into the player once it mounts.
  useEffect(() => {
    if (state !== 'playing') return
    const target = videoRef.current ?? frameRef.current?.querySelector('iframe')
    target?.focus({ preventScroll: true })
  }, [state])

  const start = () => {
    document.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: film.id }))
    setState('playing')
  }

  const { source, poster } = film
  const hasSource = Boolean(source?.src)
  const playing = state === 'playing'

  return (
    <figure className={`film film--${tone} ${className}`} data-state={state} aria-labelledby={titleId}>
      <div className="film__frame" ref={frameRef}>
        {playing && source?.kind === 'file' && (
          <video
            ref={videoRef}
            className="film__media"
            controls
            autoPlay
            muted
            playsInline
            preload="auto"
            poster={poster?.src}
            onLoadedMetadata={(e) => {
              if (source.start) e.currentTarget.currentTime = source.start
            }}
            onTimeUpdate={(e) => {
              if (source.end && e.currentTarget.currentTime >= source.end) e.currentTarget.pause()
            }}
            onError={() => setState('error')}
            aria-label={film.title}
          >
            <source src={source.src} type={source.type} onError={() => setState('error')} />
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
                  <span aria-hidden>Play film</span>
                  <span className="sr-only">Play film: {film.title}</span>
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
