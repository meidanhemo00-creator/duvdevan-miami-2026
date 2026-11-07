import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/* ───────────────────────────────────────────────────────────────────────────
 *  duvdevanmission.com/resilience
 *  The page is built as one arc: from a hundred back to zero.
 *  It opens dark and hard (the unit at work), turns at "not every wound is
 *  visible", and lightens into the programme, the journeys and the ask.
 * ─────────────────────────────────────────────────────────────────────────── */

const DONATE = 'https://duvdevanfoundation.org/en/donate/'
const EMAIL = 'mailto:friends@duvdevanus.org?subject=Supporting%20the%20Duvdevan%20resilience%20programme'
const M = './media/'

type Film = { src: string; title: string; poster?: string }

/* ─── hooks ───────────────────────────────────────────────────────────── */

/** One-shot reveal for every [data-reveal] element. */
function useReveal() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('reveal-ready')
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.setAttribute('data-inview', '')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/** The page tone (dark → light) follows whichever [data-tone] section holds the middle of the screen. */
function useTone() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-tone]'))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) document.documentElement.dataset.tone = (e.target as HTMLElement).dataset.tone
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/** 0..1 progress of the viewport through a tall element (0 when its top hits the top of the screen). */
function useProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [p, setP] = useState(0)
  useEffect(() => {
    let raf = 0
    const read = () => {
      raf = 0
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const total = r.height - window.innerHeight
      setP(Math.min(1, Math.max(0, total > 0 ? -r.top / total : 0)))
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
      cancelAnimationFrame(raf)
    }
  }, [])
  return [ref, p] as const
}

function useInView<T extends HTMLElement>(threshold = 0.4) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, seen] as const
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ─── small parts ─────────────────────────────────────────────────────── */

function Logo({ className = '' }: { className?: string }) {
  return <img className={`logo ${className}`} src={`${M}logo.png`} alt="Duvdevan" />
}

function Eyebrow({ children, n }: { children: ReactNode; n?: string }) {
  return (
    <p className="eyebrow" data-reveal>
      {n && <span className="eyebrow__n">{n}</span>}
      <span>{children}</span>
    </p>
  )
}

function CountUp({ to, prefix = '', suffix = '', format = true }: { to: number; prefix?: string; suffix?: string; format?: boolean }) {
  const [ref, seen] = useInView<HTMLSpanElement>(0.6)
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!seen) return
    if (reduced()) return setV(to)
    const t0 = performance.now()
    const dur = 1800
    let raf = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur)
      setV(Math.round(to * (1 - Math.pow(1 - k, 4))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to])
  return (
    <span ref={ref} className="count">
      {prefix}
      {format ? v.toLocaleString('en-US') : v}
      {suffix}
    </span>
  )
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
    </svg>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden className="arrow">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

/* ─── film lightbox ───────────────────────────────────────────────────── */

function FilmLightbox({ film, onClose }: { film: Film | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (film && !d.open) d.showModal()
    if (!film && d.open) d.close()
  }, [film])
  return (
    <dialog
      ref={ref}
      className="lightbox"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      aria-label={film?.title}
    >
      {film && (
        <div className="lightbox__inner">
          <video src={film.src} poster={film.poster} controls autoPlay playsInline className="lightbox__video" />
          <div className="lightbox__bar">
            <span className="hud">{film.title}</span>
            <button className="lightbox__close" onClick={onClose} aria-label="Close film">
              Close
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}

/* ─── header ──────────────────────────────────────────────────────────── */

function Header() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`header ${scrolled ? 'is-scrolled' : ''}`}>
      <a href="#top" className="header__brand" aria-label="Friends of Duvdevan, top of page">
        <Logo />
        <span className="header__org">Resilience Programme</span>
      </a>
      <nav className="header__nav" aria-label="Sections">
        <a href="#weight">The weight</a>
        <a href="#team">The team</a>
        <a href="#programme">The programme</a>
        <a href="#journeys">Journeys</a>
      </nav>
      <a className="btn btn--small" href={DONATE} target="_blank" rel="noopener noreferrer">
        Donate
      </a>
    </header>
  )
}

/* ─── 01 hero ─────────────────────────────────────────────────────────── */

function Hero({ play }: { play: (f: Film) => void }) {
  return (
    <section className="hero" id="top" data-tone="dark">
      <div className="hero__media" aria-hidden>
        <video className="hero__video" src={`${M}hero-loop.mp4`} poster={`${M}dusk.jpg`} autoPlay muted loop playsInline />
        <div className="hero__shade" />
      </div>
      <div className="hero__hud" aria-hidden>
        <span className="brackets" />
        <span className="hud hero__rec">
          <span className="rec-dot" /> REC · Unit 217
        </span>
        <span className="hud hero__ref">Undercover · Classified</span>
      </div>
      <div className="hero__content">
        <p className="hero__kicker" data-intro style={{ '--i': 0 } as CSSProperties}>
          <span>Friends of Duvdevan</span>
          <span className="hero__kicker-sep"> · </span>
          <span>The Resilience Programme</span>
        </p>
        <h1 className="hero__title">
          <span data-intro style={{ '--i': 1 } as CSSProperties}>
            They fought for us
          </span>
          <span data-intro style={{ '--i': 2 } as CSSProperties}>
            in silence.
          </span>
        </h1>
        <p className="hero__lead" data-intro style={{ '--i': 3 } as CSSProperties}>
          In places most of us will never see. Now it is our turn to stand beside them.
        </p>
        <div className="hero__actions" data-intro style={{ '--i': 4 } as CSSProperties}>
          <a className="btn" href={DONATE} target="_blank" rel="noopener noreferrer">
            Stand with them <Arrow />
          </a>
          <button
            className="btn btn--ghost"
            onClick={() => play({ src: `${M}unit-film.mp4`, title: 'Duvdevan · Unit 217', poster: `${M}nvg.jpg` })}
          >
            <PlayIcon /> Watch the unit at work
          </button>
        </div>
      </div>
      <a className="hero__cue" href="#weight" aria-label="Scroll to the story">
        <span className="hud">Scroll</span>
        <span className="hero__cue-line" />
      </a>
    </section>
  )
}

/* ─── 02 zero to a hundred ────────────────────────────────────────────── */

const beats = [
  { time: '07:00', level: 0, title: 'Breakfast with his family.', body: 'An ordinary morning. Coffee, his kids, the news on in the background.', img: '' },
  { time: '09:00', level: 100, title: 'A firefight in the heart of a refugee camp.', body: 'Plain clothes, a false identity, seconds to decide. Everything he trained for, all at once.', img: 'breach.jpg' },
  { time: '11:00', level: 0, title: 'Home again.', body: 'Back at the table, as if nothing happened. He can’t tell anyone where he has been.', img: '' },
]

function ZeroToHundred() {
  const [ref, p] = useProgress<HTMLElement>()
  const idx = Math.min(beats.length - 1, Math.floor(p * beats.length * 0.999))
  // Intensity rises fast into the middle beat and falls away after it.
  const level = Math.round(p < 0.5 ? 100 * Math.pow(Math.min(1, p / 0.42), 1.6) : 100 * Math.pow(Math.max(0, 1 - (p - 0.58) / 0.42), 1.6))
  const clamped = Math.max(0, Math.min(100, p > 0.42 && p < 0.58 ? 100 : level))
  const pathLen = 1
  return (
    <section className="zth" id="weight" ref={ref} data-tone="dark" aria-label="A day in the unit">
      <div className="zth__stage">
        {beats.map((b, i) =>
          b.img ? (
            <img key={b.time} className={`zth__bg ${i === idx ? 'is-on' : ''}`} src={M + b.img} alt="" aria-hidden />
          ) : null,
        )}
        <div className="zth__grid wrap">
          <div className="zth__meter" aria-hidden>
            <span className="hud">Intensity</span>
            <span className={`zth__level ${clamped >= 70 ? 'is-hot' : ''}`}>
              {clamped}
            </span>
            <svg className="zth__pulse" viewBox="0 0 600 120" preserveAspectRatio="none">
              <path
                d="M0 100 H170 L190 100 L205 92 L215 100 L240 100 L255 10 L270 115 L285 60 L300 100 L330 100 L345 18 L360 112 L372 70 L385 100 H600"
                pathLength={pathLen}
                style={{ strokeDashoffset: 1 - p }}
              />
            </svg>
          </div>
          <ol className="zth__beats">
            {beats.map((b, i) => (
              <li key={b.time} className={`zth__beat ${i === idx ? 'is-on' : ''} ${i < idx ? 'is-past' : ''}`}>
                <span className="zth__time">{b.time}</span>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className="zth__foot wrap hud">
          150–200 operations in a single mandatory service · <span className="zth__progress">{String(idx + 1).padStart(2, '0')} / 03</span>
        </p>
      </div>
    </section>
  )
}

function Challenge() {
  return (
    <section className="challenge wrap" data-tone="dark">
      <p className="challenge__line" data-reveal>
        <span>From zero to a hundred</span> <em>in a heartbeat.</em>
      </p>
      <p className="challenge__line challenge__line--b" data-reveal style={{ '--d': 2 } as CSSProperties}>
        <span>From a hundred back to zero:</span> <strong>that is the real challenge.</strong>
      </p>
    </section>
  )
}

/* ─── 03 why this unit carries more ───────────────────────────────────── */

const burdens = [
  { k: 'Always on', t: 'Never off the line', b: 'Duvdevan is in operations around the clock, in peacetime and at war. There is no quiet season.' },
  { k: 'Classified', t: 'Nothing to talk about', b: 'Almost everything they do is secret. Not with friends, not at home. The weight stays inside.' },
  { k: 'Undercover', t: 'Two identities', b: 'They work in civilian clothes, deep inside hostile ground, holding a second self and moving between worlds.' },
  { k: 'Selection', t: 'Trained at the edge', b: 'Some of the hardest training in the IDF, built to keep them sharp, quiet and moving forward.' },
]

function Burden() {
  return (
    <section className="burden" data-tone="dark" aria-labelledby="burden-title">
      <div className="wrap burden__head">
        <Eyebrow n="01">The unit</Eyebrow>
        <h2 className="display burden__title" id="burden-title" data-reveal>
          Few units in the IDF carry this much.
        </h2>
        <p className="burden__lead" data-reveal style={{ '--d': 1 } as CSSProperties}>
          Constant operations, total secrecy and relentless training make Duvdevan one of the units most exposed to
          post-traumatic stress in the entire IDF.
        </p>
      </div>
      <div className="wrap burden__grid">
        <figure className="burden__photo" data-reveal="frame">
          <img src={`${M}watch.jpg`} alt="A Duvdevan operator, masked, at an observation post" loading="lazy" />
        </figure>
        <ul className="burden__list">
          {burdens.map((x, i) => (
            <li key={x.k} data-reveal style={{ '--d': i } as CSSProperties}>
              <span className="hud">{x.k}</span>
              <h3>{x.t}</h3>
              <p>{x.b}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ─── 04 the turn ─────────────────────────────────────────────────────── */

const turnWords = 'They were trained to stay sharp, keep quiet and carry on. But when the service ends, the weight does not always disappear.'.split(' ')

function Turn() {
  const [ref, p] = useProgress<HTMLElement>()
  const shown = p * (turnWords.length + 6)
  return (
    <section className="turn" ref={ref} data-tone="dusk" aria-labelledby="turn-title">
      <div className="turn__stage">
        <img className="turn__img" src={`${M}alone.jpg`} alt="" aria-hidden style={{ '--p': p } as CSSProperties} />
        <div className="turn__copy wrap">
          <h2 className="display turn__title" id="turn-title">
            Not every wound is visible.
          </h2>
          <p className="turn__words" aria-label={turnWords.join(' ')}>
            {turnWords.map((w, i) => (
              <span key={i} aria-hidden className="turn__w" style={{ '--k': Math.max(0, Math.min(1, shown - i)) } as CSSProperties}>
                {w}{' '}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── 05 from inside the team ─────────────────────────────────────────── */

function Team() {
  return (
    <section className="team" id="team" data-tone="light" aria-labelledby="team-title">
      <div className="wrap team__grid">
        <div className="team__copy">
          <Eyebrow n="02">Our approach</Eyebrow>
          <h2 className="display team__title" id="team-title" data-reveal>
            Healed by the people who were there.
          </h2>
          <p className="team__lead" data-reveal style={{ '--d': 1 } as CSSProperties}>
            We learned that the best way to treat a Duvdevan operator is from inside his team. So our psychologists and
            staff come from inside the Duvdevan family. Some of our key therapists served in the unit, studied psychology
            and came back to care for their brothers in arms.
          </p>
          <blockquote className="team__quote" data-reveal style={{ '--d': 2 } as CSSProperties}>
            A soldier may find it easier to open up to someone who knows the unit from within.
          </blockquote>
          <p className="team__note" data-reveal style={{ '--d': 3 } as CSSProperties}>
            We built programmes together with the IDF and are among the few organisations authorised to support soldiers
            while they are still serving.
          </p>
        </div>
        <figure className="team__photo" data-reveal="frame">
          <img src={`${M}team.jpg`} alt="A Duvdevan team standing together in a circle on a resilience retreat" loading="lazy" />
          <figcaption className="hud">Team retreat · Sri Lanka</figcaption>
        </figure>
      </div>

      <div className="wrap stats" aria-label="The foundation in numbers">
        <div className="stat" data-reveal>
          <span className="stat__n">
            <CountUp to={1000} suffix="+" />
          </span>
          <span className="stat__l">resilience workshops held</span>
        </div>
        <div className="stat" data-reveal style={{ '--d': 1 } as CSSProperties}>
          <span className="stat__n">
            <CountUp to={1000} suffix="+" />
          </span>
          <span className="stat__l">soldiers and veterans supported</span>
        </div>
        <div className="stat" data-reveal style={{ '--d': 2 } as CSSProperties}>
          <span className="stat__n">
            <CountUp to={350} />
          </span>
          <span className="stat__l">scholarships awarded</span>
        </div>
        <div className="stat" data-reveal style={{ '--d': 3 } as CSSProperties}>
          <span className="stat__n">
            4,000<span className="stat__dash">–</span>5,000
          </span>
          <span className="stat__l">people in daily contact with the community</span>
        </div>
      </div>
      <p className="wrap motto" data-reveal>
        They fight for us. <span>We fight for them.</span>
      </p>
    </section>
  )
}

/* ─── 06 the programme ────────────────────────────────────────────────── */

const stages = [
  {
    when: 'During service',
    title: 'The night after',
    body: 'When a traumatic event hits a team, we work with the military to hold a workshop for processing combat experiences, as early as possible.',
  },
  {
    when: 'At discharge',
    title: 'The way home',
    body: 'Support for the move to civilian life: helping soldiers process what they lived through and prepare for what comes next.',
  },
  {
    when: '1–3 years later',
    title: 'The team, together again',
    body: 'After travel and time apart, when everyone has gone their own way, we bring the team back together for another facilitated workshop.',
  },
]

function Stages() {
  const [active, setActive] = useState(0)
  const [ref, seen] = useInView<HTMLDivElement>(0.5)
  const [paused, setPaused] = useState(false)
  useEffect(() => {
    if (!seen || paused || reduced()) return
    const t = setTimeout(() => setActive((a) => (a + 1) % stages.length), 6000)
    return () => clearTimeout(t)
  }, [active, seen, paused])
  return (
    <div className="stages" ref={ref} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="stages__tabs" role="tablist" aria-label="Three stages of team support">
        {stages.map((s, i) => (
          <button
            key={s.when}
            role="tab"
            aria-selected={i === active}
            className={`stages__tab ${i === active ? 'is-on' : ''} ${i < active ? 'is-past' : ''}`}
            onClick={() => {
              setActive(i)
              setPaused(true)
            }}
          >
            <span className="stages__num">0{i + 1}</span>
            <span className="stages__when">{s.when}</span>
            <span className="stages__bar">
              <span className="stages__fill" key={`${active}-${paused}`} data-run={i === active && seen && !paused ? '' : undefined} />
            </span>
          </button>
        ))}
      </div>
      <div className="stages__panel" role="tabpanel" key={active}>
        <h3 className="stages__title">{stages[active].title}</h3>
        <p>{stages[active].body}</p>
      </div>
    </div>
  )
}

const care = [
  {
    t: 'Professional mental health care',
    b: 'Confidential access to specialist, trauma-focused care, and ongoing support to process experiences, find stability and move forward.',
  },
  {
    t: 'Resilience retreats',
    b: 'Time away together, out of routine and familiar surroundings, with professionals beside them: a space to process with the people who were there.',
  },
  {
    t: 'Couples and families',
    b: 'Care for partners, children and families, including couples in deep crisis, sometimes on the verge of separation, facing what combat has done to their life together.',
  },
  {
    t: 'Community and healing',
    b: 'Spaces where Duvdevan veterans can speak, or simply sit in silence, among people who understand without explanation.',
  },
  {
    t: 'Rights and legal support',
    b: 'A dedicated department that helps soldiers and veterans claim the legal rights and benefits they are entitled to, so no one fights the system alone.',
  },
]

function Programme() {
  const [open, setOpen] = useState(0)
  return (
    <section className="programme" id="programme" data-tone="light" aria-labelledby="prog-title">
      <div className="wrap">
        <Eyebrow n="03">The resilience programme</Eyebrow>
        <h2 className="display programme__title" id="prog-title" data-reveal>
          From the first night to years after.
        </h2>
        <div className="principles">
          <div className="principle" data-reveal>
            <span className="hud">Principle one</span>
            <h3>Reach them early.</h3>
            <p>Timely support after difficult events, so soldiers can process what happened and get professional help as early as possible.</p>
          </div>
          <div className="principle" data-reveal style={{ '--d': 1 } as CSSProperties}>
            <span className="hud">Principle two</span>
            <h3>Hold on when the team disperses.</h3>
            <p>
              In service, the team surrounds a soldier every day. After discharge, everyone goes their own way, and the
              loneliness can be heavy. We keep the belonging going.
            </p>
          </div>
        </div>

        <Stages />

        <div className="care">
          <h3 className="care__head" data-reveal>
            Five lines of care
          </h3>
          <ul className="care__list">
            {care.map((c, i) => (
              <li key={c.t} className={`care__item ${open === i ? 'is-open' : ''}`} data-reveal style={{ '--d': i } as CSSProperties}>
                <button className="care__btn" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                  <span className="care__n">0{i + 1}</span>
                  <span className="care__t">{c.t}</span>
                  <span className="care__plus" aria-hidden />
                </button>
                <div className="care__body">
                  <p>{c.b}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ─── banner: out of the routine ───────────────────────────────────── */

function Band() {
  const [ref, p] = useProgress<HTMLElement>()
  return (
    <section className="band" ref={ref} data-tone="light" aria-label="Out of the routine">
      <div className="band__frame">
        <img src={`${M}beach.jpg`} alt="A team retreat by the ocean in Sri Lanka, seen from above" loading="lazy" style={{ '--p': p } as CSSProperties} />
        <div className="band__copy wrap">
          <p className="hud">Resilience retreat · Sri Lanka</p>
          <p className="band__line">
            <span>No phones.</span> <span>No routine.</span> <span>Just the team.</span>
          </p>
        </div>
      </div>
    </section>
  )
}

/* ─── 07 journeys ─────────────────────────────────────────────────────── */

const tracks = {
  extreme: {
    name: 'Extreme Resilience',
    line: 'Adrenaline first. Then the conversation.',
    body: 'They are wired for intensity, so we use it. Teams skydive, surf, climb mountains and dive together, with professionals beside them. The rush opens something up, and when the day ends, they talk and share.',
    chips: ['Skydiving', 'Surfing', 'Mountain climbing', 'Diving'],
  },
  healing: {
    name: 'Healing Beyond the Battlefield',
    line: 'Far from home, room to breathe.',
    body: 'Structured journeys outside Israel: skiing, canoeing, surfing in Sri Lanka and work on therapeutic farms, combined with professionally facilitated group processing.',
    chips: ['Skiing', 'Canoeing', 'Surfing in Sri Lanka', 'Therapeutic farms'],
  },
} as const

function Tracks() {
  const [k, setK] = useState<keyof typeof tracks>('extreme')
  const t = tracks[k]
  return (
    <div className="tracks" data-reveal>
      <div className="tracks__switch" role="tablist" aria-label="Two journey tracks">
        {(Object.keys(tracks) as (keyof typeof tracks)[]).map((key) => (
          <button key={key} role="tab" aria-selected={k === key} className={k === key ? 'is-on' : ''} onClick={() => setK(key)}>
            {tracks[key].name}
          </button>
        ))}
        <span className="tracks__thumb" style={{ '--x': k === 'extreme' ? 0 : 1 } as CSSProperties} aria-hidden />
      </div>
      <div className="tracks__panel" role="tabpanel" key={k}>
        <p className="tracks__line">{t.line}</p>
        <p className="tracks__body">{t.body}</p>
        <ul className="tracks__chips">
          {t.chips.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

type Story = {
  id: string
  place: string
  coords: string
  title: string
  body: string
  quote: string
  loop: string
  poster: string
  film: string
  filmTitle: string
}

const stories: Story[] = [
  {
    id: 'srilanka',
    place: 'Sri Lanka',
    coords: '06°02′N 80°13′E',
    title: 'A team, out of routine.',
    body: 'A whole team, away from Israel, phones and everyday stress. Surfing, yoga and ice baths by day. Every evening, the team sits together for a facilitated processing conversation, with our therapists there.',
    quote: '“It gives us strength to keep going.”',
    loop: 'srilanka-loop.mp4',
    poster: 'surf.jpg',
    film: 'srilanka-film.mp4',
    filmTitle: 'Team journey · Sri Lanka',
  },
  {
    id: 'canoe',
    place: 'Ontario, Canada',
    coords: '45°20′N 79°13′W',
    title: 'Days on the water.',
    body: 'Days on the water with friends who have stood beside you and understand you without needing every word. Time to laugh, breathe and heal together, hosted by our Toronto family.',
    quote: '“This is part of how we build resilience.”',
    loop: 'canoe-loop.mp4',
    poster: 'canoe.jpg',
    film: 'canoe-film.mp4',
    filmTitle: 'Canoe journey · Canada',
  },
]

function StoryCard({ s, play, flip }: { s: Story; play: (f: Film) => void; flip?: boolean }) {
  const vid = useRef<HTMLVideoElement>(null)
  const [ref, seen] = useInView<HTMLElement>(0.35)
  useEffect(() => {
    const v = vid.current
    if (!v || reduced()) return
    if (seen) v.play().catch(() => {})
  }, [seen])
  const open = () => play({ src: M + s.film, title: s.filmTitle, poster: M + s.poster })
  return (
    <article className={`story ${flip ? 'story--flip' : ''}`} ref={ref} id={s.id}>
      <button className="story__media" onClick={open} aria-label={`Play the film: ${s.filmTitle}`} data-reveal="frame">
        <video ref={vid} src={seen ? M + s.loop : undefined} poster={M + s.poster} muted loop playsInline preload="none" />
        <span className="story__play">
          <span className="story__play-dot">
            <PlayIcon />
          </span>
          <span>Watch the film</span>
        </span>
        <span className="story__coords hud">{s.coords}</span>
      </button>
      <div className="story__copy">
        <p className="hud story__place" data-reveal>
          {s.place}
        </p>
        <h3 className="display story__title" data-reveal>
          {s.title}
        </h3>
        <p className="story__body" data-reveal style={{ '--d': 1 } as CSSProperties}>
          {s.body}
        </p>
        <p className="story__quote" data-reveal style={{ '--d': 2 } as CSSProperties}>
          {s.quote}
        </p>
      </div>
    </article>
  )
}

const day = [
  { t: 'Morning', b: 'Out of routine: the water, the mountain, the sky.' },
  { t: 'Evening', b: 'The team sits together for a facilitated processing conversation.' },
  { t: 'Between', b: 'Our therapists are there. When someone needs more, a direct path to one-to-one care, without bureaucracy or shame.' },
]

function Journeys({ play }: { play: (f: Film) => void }) {
  return (
    <section className="journeys" id="journeys" data-tone="light" aria-labelledby="j-title">
      <div className="wrap">
        <Eyebrow n="04">Journeys</Eyebrow>
        <h2 className="display journeys__title" id="j-title" data-reveal>
          <span>They go as a team.</span> <span>They come back lighter.</span>
        </h2>
        <p className="journeys__lead" data-reveal style={{ '--d': 1 } as CSSProperties}>
          The activity is never the point. The point is to pause and be together, somewhere that makes room for the hard
          work. Plenty of joy, because therapy means facing painful things, and the shared experience makes it easier to
          begin.
        </p>
        <Tracks />
      </div>
      <div className="wrap stories">
        {stories.map((s, i) => (
          <StoryCard key={s.id} s={s} play={play} flip={i % 2 === 1} />
        ))}
      </div>
      <div className="wrap day">
        <p className="hud day__head" data-reveal>
          How a journey day runs
        </p>
        <ol className="day__list">
          {day.map((d, i) => (
            <li key={d.t} data-reveal style={{ '--d': i } as CSSProperties}>
              <span className="day__t">{d.t}</span>
              <p>{d.b}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ─── 08 the wider circle ─────────────────────────────────────────────── */

function Circle() {
  const ring = ['Partners', 'Children', 'Siblings', 'Parents', 'Bereaved families', 'Couples in crisis']
  return (
    <section className="circle" data-tone="light" aria-labelledby="circle-title">
      <div className="wrap circle__grid">
        <div>
          <Eyebrow n="05">The wider circle</Eyebrow>
          <h2 className="display circle__title" id="circle-title" data-reveal>
            Service doesn’t end at the soldier.
          </h2>
          <p className="circle__lead" data-reveal style={{ '--d': 1 } as CSSProperties}>
            What they carry comes home with them. Our care reaches the people around them too.
          </p>
        </div>
        <ul className="circle__ring" aria-label="Who we support">
          {ring.map((r, i) => (
            <li key={r} data-reveal style={{ '--d': i } as CSSProperties}>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ─── 09 why now ──────────────────────────────────────────────────────── */

function WhyNow() {
  return (
    <section className="why" data-tone="dark" aria-labelledby="why-title">
      <div className="wrap why__inner">
        <div className="why__marks" aria-hidden>
          <span data-reveal="line" />
          <span data-reveal="line" style={{ '--d': 2 } as CSSProperties} />
          <span data-reveal="line" style={{ '--d': 4 } as CSSProperties} />
        </div>
        <p className="hud" data-reveal>
          Why now
        </p>
        <h2 className="why__title" id="why-title" data-reveal>
          In the past six months, we lost three veterans of the unit to suicide.
        </h2>
        <p className="why__body" data-reveal style={{ '--d': 1 } as CSSProperties}>
          All three were long-serving members of our wider community, around forty years old, and parents. We lost them
          despite the many workshops and individual treatments already given. It taught us, painfully, that our work cannot
          stop with recently discharged teams. We must reach older veterans too: more retreats, more one-to-one care, wider
          outreach.
        </p>
      </div>
    </section>
  )
}

/* ─── 10 give ─────────────────────────────────────────────────────────── */

function Give() {
  const covers = ['Team workshops', 'One-to-one therapy', 'Retreats and journeys', 'Families and partners', 'Rights and legal support']
  return (
    <section className="give" id="give" data-tone="light" aria-labelledby="give-title">
      <div className="wrap give__grid">
        <div className="give__copy">
          <Eyebrow n="06">Support the whole programme</Eyebrow>
          <h2 className="display give__title" id="give-title" data-reveal>
            Stand behind every step.
          </h2>
          <p className="give__lead" data-reveal style={{ '--d': 1 } as CSSProperties}>
            Supporting the programme as a whole means standing behind the full continuum of care: from the first workshop
            in service, through retreats and therapy, to the families and couples at home.
          </p>
          <div className="give__actions" data-reveal style={{ '--d': 2 } as CSSProperties}>
            <a className="btn btn--dark" href={DONATE} target="_blank" rel="noopener noreferrer">
              Donate now <Arrow />
            </a>
            <a className="btn btn--line" href={EMAIL}>
              Talk to us about a major gift
            </a>
          </div>
        </div>
        <div className="budget" data-reveal>
          <span className="hud">Annual resilience programme</span>
          <span className="budget__n">
            <CountUp to={2} prefix="US$" format={false} />
            <span className="budget__m">million</span>
          </span>
          <ul className="budget__list">
            {covers.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <p className="budget__note">A preliminary estimate. A detailed budget will be developed together with our partners.</p>
        </div>
      </div>

      <div className="wrap trust" aria-label="Nonprofit status and transparency">
        <a className="trust__item" href="https://apps.irs.gov/app/eos/" target="_blank" rel="noopener noreferrer" data-reveal>
          <span className="trust__k">501(c)(3)</span>
          <span className="trust__v">Listed in IRS Publication 78 · EIN 83-0860160</span>
        </a>
        <a className="trust__item" href="https://www.charitynavigator.org/ein/830860160" target="_blank" rel="noopener noreferrer" data-reveal style={{ '--d': 1 } as CSSProperties}>
          <span className="trust__k">89%</span>
          <span className="trust__v">Charity Navigator · three stars</span>
        </a>
        <a className="trust__item" href="https://www.guidestar.org/profile/83-0860160" target="_blank" rel="noopener noreferrer" data-reveal style={{ '--d': 2 } as CSSProperties}>
          <span className="trust__k">Platinum</span>
          <span className="trust__v">Candid Seal of Transparency 2025</span>
        </a>
      </div>
    </section>
  )
}

/* ─── 11 closing ──────────────────────────────────────────────────────── */

function Closing() {
  return (
    <section className="closing" data-tone="dark" aria-labelledby="close-title">
      <img className="closing__img" src={`${M}dusk.jpg`} alt="" aria-hidden loading="lazy" />
      <div className="wrap closing__inner">
        <Logo className="closing__logo" />
        <h2 className="display closing__title" id="close-title" data-reveal>
          Stand beside those who stood for us.
        </h2>
        <div className="closing__actions" data-reveal style={{ '--d': 1 } as CSSProperties}>
          <a className="btn" href={DONATE} target="_blank" rel="noopener noreferrer">
            Donate now <Arrow />
          </a>
          <a className="btn btn--ghost" href={EMAIL}>
            friends@duvdevanus.org
          </a>
        </div>
      </div>
      <footer className="footer wrap">
        <p>
          Friends of Duvdevan is a U.S. nonprofit recognised under section 501(c)(3), EIN 83-0860160. Our partner in Israel,
          the Duvdevan Foundation, delivers the programmes on the ground. Credentials above apply to Friends of Duvdevan in
          the United States.
        </p>
        <p className="hud">They fight for us · We fight for them</p>
      </footer>
    </section>
  )
}

/* ─── page ────────────────────────────────────────────────────────────── */

export default function App() {
  useReveal()
  useTone()
  const [film, setFilm] = useState<Film | null>(null)
  const play = useCallback((f: Film) => setFilm(f), [])
  return (
    <>
      <Header />
      <main>
        <Hero play={play} />
        <ZeroToHundred />
        <Challenge />
        <Burden />
        <Turn />
        <Team />
        <Programme />
        <Band />
        <Journeys play={play} />
        <Circle />
        <WhyNow />
        <Give />
        <Closing />
      </main>
      <FilmLightbox film={film} onClose={() => setFilm(null)} />
    </>
  )
}
