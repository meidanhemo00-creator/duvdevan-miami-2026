import { useId, useState, type FormEvent } from 'react'
import { site } from '../content/site'
import './RsvpForm.css'

type Status = 'idle' | 'sending' | 'done' | 'error'

/**
 * The RSVP form: name, email, phone and additional guests. Each reply is
 * POSTed as JSON to `site.rsvp.endpoint`. The body is sent as text/plain so
 * a Google Apps Script web app accepts it without a CORS preflight.
 */
export function RsvpForm() {
  const { rsvp } = site
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const id = useId()

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>
    if (data.company) return // honeypot: bots fill every field
    if (!rsvp.endpoint) {
      setStatus('error')
      setMessage('RSVP isn’t open yet. Please try again soon.')
      return
    }
    setStatus('sending')
    try {
      await fetch(rsvp.endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          guests: Number(data.guests) || 0,
          event: 'Duvdevan in Los Angeles · 2026-11-15',
          submittedAt: new Date().toISOString(),
        }),
      })
      setStatus('done')
      form.reset()
    } catch {
      setStatus('error')
      setMessage('That didn’t go through. Check your connection and try again.')
    }
  }

  if (status === 'done') {
    return (
      <div className="rsvp-form rsvp-form--done" role="status">
        <span className="rec-dot" aria-hidden />
        <p className="rsvp-form__thanks">{rsvp.thanks}</p>
      </div>
    )
  }

  return (
    <form className="rsvp-form" onSubmit={onSubmit} aria-labelledby={`${id}-title`} noValidate={false}>
      <h3 id={`${id}-title`} className="rsvp-form__title">
        {rsvp.heading}
      </h3>
      <p className="rsvp-form__intro">{rsvp.intro}</p>

      <div className="rsvp-form__grid">
        <label className="rsvp-form__field rsvp-form__field--wide">
          <span>Full name</span>
          <input name="name" type="text" autoComplete="name" required maxLength={120} />
        </label>
        <label className="rsvp-form__field">
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required maxLength={160} />
        </label>
        <label className="rsvp-form__field">
          <span>Phone</span>
          <input name="phone" type="tel" autoComplete="tel" required maxLength={40} pattern="[0-9+()\-\s.]{7,}" />
        </label>
        <label className="rsvp-form__field rsvp-form__field--wide">
          <span>Additional guests</span>
          <select name="guests" defaultValue="0">
            {Array.from({ length: rsvp.maxGuests + 1 }, (_, n) => (
              <option key={n} value={n}>
                {n === 0 ? 'Just me' : `+${n}`}
              </option>
            ))}
          </select>
        </label>
        {/* Honeypot, hidden from people and screen readers. */}
        <input className="rsvp-form__trap" name="company" tabIndex={-1} autoComplete="off" aria-hidden />
      </div>

      <button className="rsvp rsvp-form__submit" type="submit" disabled={status === 'sending'}>
        <span className="rec-dot" aria-hidden />
        {status === 'sending' ? 'Sending…' : 'Confirm attendance'}
      </button>
      {status === 'error' && (
        <p className="rsvp-form__error" role="alert">
          {message}
        </p>
      )}
    </form>
  )
}
