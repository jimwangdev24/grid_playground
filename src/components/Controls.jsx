import { useState } from 'react'
import { TONES, IMAGES } from '../theme.js'
import { MAX_ROW_SPAN } from './Card.jsx'

const CONTENT_TOGGLES = [
  ['Image', 'showImage'],
  ['Heading', 'showHeading'],
  ['Eyebrow', 'showSubheading'],
  ['Body', 'showBody'],
]

const Label = ({ children, className = '' }) => (
  <span className={`text-xs font-medium tracking-widest text-white/50 uppercase ${className}`}>
    {children}
  </span>
)

function TonePicker({ selectedTone, customTones, onPick, onAddTone }) {
  const [draft, setDraft] = useState('#ff8552')
  const hex = draft.startsWith('#') ? draft : `#${draft}`
  const valid = /^#[0-9a-fA-F]{6}$/.test(hex)

  const swatches = [
    ...Object.entries(TONES).map(([key, t]) => ({ key, bg: t.bg, label: t.label })),
    ...customTones.map((c) => ({ key: c, bg: c, label: c })),
  ]

  //choose the color, see if the code is valided
  const add = () => {
    if (!valid) return
    const color = hex.toLowerCase()
    onAddTone(color)
    onPick(color)
  }

  return (
    <div>
      <Label className="mb-2 block">Tone</Label>
      <div className="flex flex-wrap gap-2">
        {swatches.map(({ key, bg, label }) => (
          <button
            key={key}
            title={label}
            onClick={() => onPick(key)}
            className={`size-8 rounded-full ring-offset-2 ring-offset-ink transition-transform hover:scale-110 ${
              selectedTone === key ? 'ring-2 ring-lime' : 'ring-1 ring-white/20'
            }`}
            style={{ backgroundColor: bg }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="color"
          value={valid ? hex : '#888888'}
          onChange={(e) => setDraft(e.target.value)}
          className="size-8 shrink-0 cursor-pointer rounded-lg border-none bg-transparent p-0"
          title="Pick a color"
        />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          spellCheck={false}
          placeholder="#rrggbb"
          className="w-24 rounded-lg bg-white/10 px-2.5 py-1.5 font-mono text-xs text-white outline-none placeholder:text-white/30"
        />
        <button
          onClick={add}
          disabled={!valid}
          className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  )
}

function Section({ label, hint, children }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-white/5 p-4">
      <div>
        <p className="text-xs font-medium tracking-widest text-lavender uppercase">{label}</p>
        {hint && <p className="mt-1 text-xs leading-relaxed text-white/40">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

function ControlSlider({ label, value, min, max, unit = '', onChange }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <Label>{label}</Label>
        <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs text-lime">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </label>
  )
}

function Stepper({ label, value, min, max, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="size-7 rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          −
        </button>
        <span className="w-5 text-center font-mono text-sm text-lime">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="size-7 rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          +
        </button>
      </div>
    </div>
  )
}

function ToggleChip({ label, active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? 'bg-lime text-ink' : 'bg-white/10 text-white/60 hover:bg-white/20'
      }`}
    >
      {label}
    </button>
  )
}

function Controls({
  grid,
  onGridChange,
  cardStyle,
  onCardStyleChange,
  selectedCard,
  onCardChange,
  onRemoveCard,
  customTones,
  onAddTone,
}) {
  const setGrid = (key) => (value) => onGridChange({ ...grid, [key]: value })
  const setStyle = (key) => (value) => onCardStyleChange({ ...cardStyle, [key]: value })

  return (
    <aside className="flex flex-col gap-3 self-start rounded-2xl bg-ink p-4 text-white shadow-lg [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin] lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:w-80 lg:shrink-0 lg:overflow-y-auto">
      {/* selected card first so the panel is visible without scrolling the sidebar */}
      {selectedCard ? (
        <Section label="Selected card" hint="Applies only to the highlighted card">
          <Stepper
            label="Col span"
            value={selectedCard.colSpan}
            min={1}
            max={grid.columns}
            onChange={(v) => onCardChange({ colSpan: v })}
          />
          <Stepper
            label="Row span"
            value={selectedCard.rowSpan}
            min={1}
            max={MAX_ROW_SPAN}
            onChange={(v) => onCardChange({ rowSpan: v })}
          />

          <div>
            <Label className="mb-2 block">Content</Label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TOGGLES.map(([label, key]) => (
                <ToggleChip
                  key={key}
                  label={label}
                  active={selectedCard[key]}
                  onToggle={() => onCardChange({ [key]: !selectedCard[key] })}
                />
              ))}
            </div>
          </div>

          {selectedCard.showImage && (
            <div>
              <Label className="mb-2 block">Photo</Label>
              <div className="flex flex-wrap gap-2">
                {IMAGES.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => onCardChange({ image: i })}
                    className={`size-10 overflow-hidden rounded-lg transition-transform hover:scale-110 ${
                      selectedCard.image === i ? 'ring-2 ring-lime' : 'ring-1 ring-white/20'
                    }`}
                  >
                    <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <ToggleChip
                  label="Use as background"
                  active={!!selectedCard.imageBg}
                  onToggle={() => onCardChange({ imageBg: !selectedCard.imageBg })}
                />
              </div>
            </div>
          )}

          <TonePicker
            selectedTone={selectedCard.tone}
            customTones={customTones}
            onPick={(tone) => onCardChange({ tone })}
            onAddTone={onAddTone}
          />

          <button
            onClick={onRemoveCard}
            className="rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-red-300 hover:bg-red-400/20"
          >
            Remove card
          </button>
        </Section>
      ) : (
        <p className="rounded-2xl border border-dashed border-white/15 p-4 text-xs leading-relaxed text-lime">
          Select a card in the preview to edit its span, content, and tone. Click its text to edit
          inline.
        </p>
      )}

      <Section label="Layout" hint="Grid structure for the whole board">
        <ControlSlider label="Columns" value={grid.columns} min={1} max={12} onChange={setGrid('columns')} />
        <ControlSlider label="Row height" value={grid.rowHeight} min={80} max={240} unit="px" onChange={setGrid('rowHeight')} />
        <ControlSlider label="Gap" value={grid.gap} min={0} max={48} unit="px" onChange={setGrid('gap')} />
      </Section>

      <Section label="Card style" hint="Shared by every card">
        <ControlSlider label="Radius" value={cardStyle.radius} min={0} max={40} unit="px" onChange={setStyle('radius')} />
        <ControlSlider label="Padding" value={cardStyle.padding} min={8} max={48} unit="px" onChange={setStyle('padding')} />
        <ControlSlider label="Shadow" value={cardStyle.shadow} min={0} max={3} onChange={setStyle('shadow')} />
      </Section>
    </aside>
  )
}

export default Controls
