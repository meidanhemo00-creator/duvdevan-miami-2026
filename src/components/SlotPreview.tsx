import './SlotPreview.css'

type Props = { label: string; note?: string; variant?: 'fact' | 'cta' }

/** Marks where an unconfirmed detail will appear. Preview mode only, never public. */
export function SlotPreview({ label, note, variant = 'fact' }: Props) {
  return (
    <span className={`slot-preview slot-preview--${variant}`}>
      <span className="slot-preview__label micro">{label}</span>
      <span className="slot-preview__note">{note ?? 'Awaiting confirmation'}</span>
    </span>
  )
}
