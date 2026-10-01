import { useState } from 'react'
import { toneStyle, withAlpha, OVERLAY_ALPHA, SHADOWS, IMAGES } from '../theme.js'

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

// Plain HTML + CSS export: renders cleaner than JSX with arbitrary Tailwind
// values, and works anywhere the user pastes it.
function generateCode({ grid, cardStyle, cards }) {
  const html = [
    '<div class="grid">',
    ...cards.map((card) => {
      const lines = [`  <div class="card card-${card.id}">`]
      if (card.showSubheading) lines.push(`    <h2>${esc(card.subheading)}</h2>`)
      if (card.showImage && !card.imageBg)
        lines.push(`    <img class="media" src="${IMAGES[card.image]}" alt="" />`)
      if (card.showHeading) lines.push(`    <h1>${esc(card.heading)}</h1>`)
      if (card.showBody) lines.push(`    <p>${esc(card.body)}</p>`)
      lines.push('  </div>')
      return lines.join('\n')
    }),
    '</div>',
  ].join('\n')

  const css = [
    `.grid {
  display: grid;
  grid-template-columns: repeat(${grid.columns}, minmax(0, 1fr));
  grid-auto-rows: ${grid.rowHeight}px;
  gap: ${grid.gap}px;
}`,
    `.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: ${cardStyle.radius}px;
  padding: ${cardStyle.padding}px;${cardStyle.shadow ? `\n  box-shadow: ${SHADOWS[cardStyle.shadow]};` : ''}
}`,
    `.card h1 { margin: auto 0 0; font-size: 24px; font-weight: 600; letter-spacing: -0.02em; }
.card h2 { margin: 0 0 8px; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.6; }
.card p { margin: 4px 0 0; font-size: 14px; opacity: 0.7; }
.card .media { flex: 1; min-height: 48px; width: 100%; border-radius: 12px; object-fit: cover; }`,
    ...cards.map((card) => {
      const tone = toneStyle(card.tone)
      const overlay = withAlpha(tone.bg, OVERLAY_ALPHA)
      const rules = [
        card.showImage && card.imageBg
          ? `background: linear-gradient(${overlay}, ${overlay}), url(${IMAGES[card.image]}) center / cover;`
          : `background: ${tone.bg};`,
        `color: ${tone.text};`,
      ]
      // clamp like the live preview does, or the export gains phantom columns
      const colSpan = Math.min(card.colSpan, grid.columns)
      if (colSpan > 1) rules.push(`grid-column: span ${colSpan};`)
      if (card.rowSpan > 1) rules.push(`grid-row: span ${card.rowSpan};`)
      return `.card-${card.id} { ${rules.join(' ')} }`
    }),
  ].join('\n\n')

  return { html, css }
}

function CodeBlock({ label, code }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium tracking-widest text-white/50 uppercase">{label}</span>
        <button
          onClick={copy}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            copied ? 'bg-lime text-ink' : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="max-h-80 overflow-auto rounded-xl bg-white/5 p-4 font-mono text-xs leading-relaxed text-lime/90">
        {code}
      </pre>
    </div>
  )
}

function CodeExportPanel({ grid, cardStyle, cards }) {
  const { html, css } = generateCode({ grid, cardStyle, cards })

  return (
    <section className="flex flex-col gap-6 rounded-2xl bg-ink p-6 text-white shadow-lg md:flex-row">
      <CodeBlock label="HTML" code={html} />
      <CodeBlock label="CSS" code={css} />
    </section>
  )
}

export default CodeExportPanel
