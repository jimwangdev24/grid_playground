import { useEffect, useRef, useState } from 'react'
import { toneStyle, withAlpha, OVERLAY_ALPHA, SHADOWS, IMAGES } from '../theme.js'

export const MAX_ROW_SPAN = 4

// id of the card being dragged; lets targets skip the "drop here" outline on
// the source card and distinguishes card drags from stray text drags
let draggingId = null

// Text is edited with controlled inputs styled to look like plain text —
// more predictable than contentEditable (no caret jumps, state stays in React).
function Card({ card, columns, cardStyle, selected, onSelect, onChange, onReorder }) {
  const tone = toneStyle(card.tone)
  const mediaBg = tone.text === '#ffffff' ? 'bg-white/10' : 'bg-black/10'
  const imageBg = card.showImage && card.imageBg
  // tone wash + photo in one background: no overlay element, text stays readable
  const overlay = withAlpha(tone.bg, OVERLAY_ALPHA)
  const ref = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [canDrag, setCanDrag] = useState(false)

  const outline = dragOver && draggingId && draggingId !== card.id
    ? 'outline-2 outline-dashed outline-lime outline-offset-2'
    : selected
      ? 'outline-2 outline-solid outline-lavender outline-offset-2'
      : ''

  // Auto-grow: if the content overflows the card's grid area, take one more
  // row and re-measure on the next render, until it fits (or hits the cap).
  useEffect(() => {
    const el = ref.current
    if (el && el.scrollHeight > el.clientHeight + 1 && card.rowSpan < MAX_ROW_SPAN) {
      onChange({ rowSpan: card.rowSpan + 1 })
    }
  })

  return (
    <div
      ref={ref}
      data-card-id={card.id}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      // whole card drags, except when the press starts in a text field —
      // that must stay a caret/selection gesture
      draggable={canDrag}
      onMouseDown={(e) => setCanDrag(!e.target.closest('textarea, input'))}
      onDragStart={(e) => {
        draggingId = card.id
        e.dataTransfer.setData('text/plain', String(card.id))
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setDragImage(ref.current, 24, 24)
      }}
      onDragEnd={() => {
        draggingId = null
        setCanDrag(false)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation() // handled here; keep the canvas net out of it
        setDragOver(false)
        const fromId = Number(e.dataTransfer.getData('text/plain'))
        if (fromId && fromId !== card.id) onReorder(fromId, card.id)
      }}
      // outline, not ring: the shadow slider sets an inline box-shadow, which would override ring
      className={`group relative flex cursor-pointer flex-col overflow-hidden transition-shadow ${outline}`}
      style={{
        backgroundColor: tone.bg,
        color: tone.text,
        ...(imageBg && {
          backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${IMAGES[card.image]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }),
        gridColumn: `span ${Math.min(card.colSpan, columns)}`,
        gridRow: `span ${card.rowSpan}`,
        borderRadius: `${cardStyle.radius}px`,
        padding: `${cardStyle.padding}px`,
        boxShadow: SHADOWS[cardStyle.shadow],
      }}
    >
      {/* visual affordance; dragstart bubbles up to the card handler */}
      <button
        draggable
        title="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
        className={`absolute top-2 right-2 grid size-7 cursor-grab place-items-center rounded-full text-xs opacity-0 transition-opacity group-hover:opacity-100 ${mediaBg}`}
      >
        ⠿
      </button>

      {card.showSubheading && (
        <textarea
          value={card.subheading}
          placeholder="Eyebrow label…"
          rows={1}
          onChange={(e) => onChange({ subheading: e.target.value })}
          className="mb-2 w-full resize-none bg-transparent text-[11px] font-medium tracking-widest uppercase opacity-60 field-sizing-content outline-none placeholder:opacity-50"
        />
      )}

      {card.showImage && !card.imageBg && (
        <div className={`mb-3 min-h-12 flex-1 overflow-hidden rounded-xl ${mediaBg}`}>
          <img
            src={IMAGES[card.image]}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        </div>
      )}

      <div className="mt-auto">
        {card.showHeading && (
          <textarea
            value={card.heading}
            placeholder="Heading…"
            rows={1}
            onChange={(e) => onChange({ heading: e.target.value })}
            className="w-full resize-none bg-transparent text-2xl leading-tight font-semibold tracking-tight field-sizing-content outline-none placeholder:opacity-40"
          />
        )}
        {card.showBody && (
          <textarea
            value={card.body}
            placeholder="Body text…"
            rows={2}
            onChange={(e) => onChange({ body: e.target.value })}
            className="mt-1 w-full resize-none bg-transparent text-sm leading-snug opacity-70 field-sizing-content outline-none placeholder:opacity-40"
          />
        )}
      </div>
    </div>
  )
}

export default Card
