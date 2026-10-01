import { useEffect, useState } from 'react'
import Controls from './components/Controls.jsx'
import GridPreview from './components/GridPreview.jsx'
import CodeExportPanel from './components/CodeExportPanel.jsx'


const STORAGE_KEY = 'grid-playground'
let saved = null
try {
  saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
} catch {
  /* corrupt save: fall back to defaults */
}

let nextId = saved?.cards?.length ? Math.max(...saved.cards.map((c) => c.id)) + 1 : 1
const makeCard = (overrides = {}) => ({
  id: nextId++,
  tone: 'white',
  colSpan: 1,
  rowSpan: 1,
  image: 0,
  imageBg: false,
  showImage: false,
  showHeading: true,
  showSubheading: false,
  showBody: false,
  heading: 'Card title',
  subheading: 'Eyebrow label',
  body: 'Short supporting copy for this card.',
  ...overrides,
})

const DEFAULT_GRID = { columns: 4, gap: 16, rowHeight: 120 }
const DEFAULT_STYLE = { radius: 16, padding: 16, shadow: 1 }

// Default layout mirrors the bento reference: one dark hero, a wide media
// card, and two accent tiles.
const defaultCards = () => [
  makeCard({
    tone: 'dark',
    colSpan: 2,
    rowSpan: 2,
    showSubheading: true,
    subheading: 'More offers',
    heading: 'There is something else for you',
  }),
  makeCard({
    colSpan: 2,
    rowSpan: 2,
    showImage: true,
    image: 1,
    showSubheading: true,
    subheading: 'World of hearing technology',
    heading: 'View our blog',
  }),
  makeCard({ tone: 'lavender', heading: 'About us', showSubheading: true, subheading: 'Discover our history' }),
  makeCard({ tone: 'lime', heading: 'Contact us', showSubheading: true, subheading: 'Have some questions?' }),
]

function App() {
  const [grid, setGrid] = useState(saved?.grid ?? DEFAULT_GRID)
  const [cardStyle, setCardStyle] = useState(saved?.cardStyle ?? DEFAULT_STYLE)
  // saved cards pass through makeCard so fields added later get defaults
  const [cards, setCards] = useState(() =>
    saved?.cards ? saved.cards.map((c) => makeCard(c)) : defaultCards(),
  )
  const [selectedId, setSelectedId] = useState(null)
  const [customTones, setCustomTones] = useState(saved?.customTones ?? [])
  const [showExport, setShowExport] = useState(false)

  // persist the whole design so a refresh doesn't wipe it
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ grid, cardStyle, cards, customTones }))
  }, [grid, cardStyle, cards, customTones])

  // functional updates throughout: several cards can patch state in the same
  // tick (auto-grow), and stale closures would drop writes
  const updateCard = (id, patch) =>
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const addCard = () => {
    const card = makeCard()
    setCards((prev) => [...prev, card])
    setSelectedId(card.id)
  }

  const removeCard = (id) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
    setSelectedId(null)
  }

  // Delete/Backspace removes the selected card — but never while typing
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return
      if (e.target.closest?.('input, textarea')) return
      if (selectedId != null) removeCard(selectedId)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const reorderCards = (fromId, toId) =>
    setCards((prev) => {
      const from = prev.findIndex((c) => c.id === fromId)
      const to = prev.findIndex((c) => c.id === toId)
      if (from === -1 || to === -1) return prev // foreign drag data: ignore
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(next.findIndex((c) => c.id === toId), 0, moved)
      return next
    })

  const reset = () => {
    setGrid(DEFAULT_GRID)
    setCardStyle(DEFAULT_STYLE)
    nextId = 1 // every card is replaced, so ids can start over
    setCards(defaultCards())
    setCustomTones([])
    setSelectedId(null)
  }

  const addTone = (hex) =>
    setCustomTones((prev) => (prev.includes(hex) ? prev : [...prev, hex]))

  const selectedCard = cards.find((c) => c.id === selectedId)

  return (
    <section className="mx-auto flex min-h-screen max-w-350 flex-col gap-4 p-4 md:p-6">
      <header className="flex items-center justify-between rounded-xl bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-ink text-sm font-bold text-lime">
            G
          </span>
          <h1 className="text-lg font-semibold tracking-tight">Grid Playground</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="rounded-full px-3 py-2.5 text-sm font-medium text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink"
          >
            Reset
          </button>
          <button
            onClick={() => setShowExport(!showExport)}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink/80"
          >
            {showExport ? 'Hide code' : 'Export code'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 lg:flex-row">
        <Controls
          grid={grid}
          onGridChange={setGrid}
          cardStyle={cardStyle}
          onCardStyleChange={setCardStyle}
          selectedCard={selectedCard}
          onCardChange={(patch) => updateCard(selectedId, patch)}
          onRemoveCard={() => removeCard(selectedId)}
          customTones={customTones}
          onAddTone={addTone}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <GridPreview
            grid={grid}
            cardStyle={cardStyle}
            cards={cards}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCardChange={updateCard}
            onAddCard={addCard}
            onReorder={reorderCards}
          />
          {showExport && <CodeExportPanel grid={grid} cardStyle={cardStyle} cards={cards} />}
        </div>
      </div>
    </section>
  )
}

export default App
