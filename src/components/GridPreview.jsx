import Card from './Card.jsx'

function GridPreview({ grid, cardStyle, cards, selectedId, onSelect, onCardChange, onAddCard, onReorder }) {
  // Safety net for drops that miss a card (gaps, dotted canvas, add tile):
  // route them to the nearest card so a drag never silently dies.
  const dropOnCanvas = (e) => {
    e.preventDefault()
    const fromId = Number(e.dataTransfer.getData('text/plain'))
    if (!fromId) return
    let nearest = null
    let nearestDist = Infinity
    for (const el of e.currentTarget.querySelectorAll('[data-card-id]')) {
      const r = el.getBoundingClientRect()
      const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2))
      if (d < nearestDist) {
        nearestDist = d
        nearest = Number(el.dataset.cardId)
      }
    }
    if (nearest && nearest !== fromId) onReorder(fromId, nearest)
  }

  return (
    <main
      className="dotted flex-1 rounded-2xl bg-white/40 p-4 shadow-sm ring-1 ring-ink/5 md:p-6"
      onClick={() => onSelect(null)}
      onDragOver={(e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
      }}
      onDrop={dropOnCanvas}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${grid.columns}, minmax(0, 1fr))`,
          gridAutoRows: `${grid.rowHeight}px`,
          gap: `${grid.gap}px`,
        }}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            columns={grid.columns}
            cardStyle={cardStyle}
            selected={card.id === selectedId}
            onSelect={() => onSelect(card.id)}
            onChange={(patch) => onCardChange(card.id, patch)}
            onReorder={onReorder}
          />
        ))}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddCard()
          }}
          className="grid place-items-center rounded-3xl border-2 border-dashed border-ink/15 text-ink/30 transition-colors hover:border-ink/30 hover:text-ink/50"
          style={{ borderRadius: `${cardStyle.radius}px` }}
        >
          <span className="text-sm font-medium">+ Add card</span>
        </button>
      </div>
    </main>
  )
}

export default GridPreview
