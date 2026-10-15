export const CARD_DEFAULTS = {
  tone: 'white', colSpan: 1, rowSpan: 1, image: 0, imageBg: false,
  showImage: false, showHeading: true, showSubheading: false, showBody: false,
  heading: 'Card title', subheading: 'Eyebrow label', body: 'Short supporting copy for this card.',
}

const card = (values) => ({ ...CARD_DEFAULTS, ...values })

// Built-in templates live in source, never in the writable user-preset file.
export const BUILT_IN_PRESETS = [
  {
    id: 'bento', name: 'Bento Showcase', description: 'Mixed-size tiles for a company landing page.',
    grid: { columns: 4, gap: 16, rowHeight: 120 },
    cardStyle: { radius: 16, padding: 16, shadow: 1 },
    customTones: ['#ff8552'],
    cards: [
      card({ tone: 'dark', colSpan: 2, rowSpan: 2, showImage: true, imageBg: true, image: 0,
        showSubheading: true, showBody: true, subheading: 'Made for everyday', heading: 'Better together', body: 'Discover what comes next.' }),
      card({ colSpan: 2, rowSpan: 2, showImage: true, image: 1, showSubheading: true,
        subheading: 'Behind the scenes', heading: 'Our studio' }),
      card({ tone: 'lavender', showSubheading: true, subheading: 'Our story', heading: 'About us' }),
      card({ tone: 'lime', showSubheading: true, subheading: 'Say hello', heading: 'Contact' }),
      card({ tone: '#ff8552', colSpan: 2, showHeading: false, showBody: true, body: 'Small ideas. Lasting impact.' }),
    ],
  },
  {
    id: 'editorial', name: 'Editorial Magazine', description: 'A lead story and supporting articles for a publication.',
    grid: { columns: 3, gap: 24, rowHeight: 160 },
    cardStyle: { radius: 8, padding: 24, shadow: 0 },
    customTones: ['#eee4d6'],
    cards: [
      card({ tone: 'dark', colSpan: 2, rowSpan: 3, showImage: true, imageBg: true, image: 2,
        showSubheading: true, showBody: true, subheading: 'The weekend issue', heading: 'A slower kind of living', body: 'Stories from beyond the city.' }),
      card({ tone: '#eee4d6', rowSpan: 2, showImage: true, image: 3, showSubheading: true, showBody: true,
        subheading: 'Architecture', heading: 'City notes', body: 'Places with a point of view.' }),
      card({ rowSpan: 1, showImage: true, image: 4, showHeading: false }),
      card({ tone: 'lavender', colSpan: 3, showSubheading: true, showBody: true,
        subheading: 'From the editor', heading: 'Stay curious', body: 'A fresh perspective, every week.' }),
    ],
  },
  {
    id: 'products', name: 'Product Gallery', description: 'Equal-width product cards with a full-width promotion.',
    grid: { columns: 3, gap: 20, rowHeight: 160 },
    cardStyle: { radius: 24, padding: 20, shadow: 2 },
    customTones: ['#dce8ee'],
    cards: [
      card({ rowSpan: 3, showImage: true, image: 0, showSubheading: true, showBody: true,
        subheading: 'Audio', heading: 'Daily sound', body: 'Your everyday listening companion.' }),
      card({ tone: '#dce8ee', rowSpan: 3, showImage: true, image: 1, showSubheading: true, showBody: true,
        subheading: 'Workspace', heading: 'Studio essentials', body: 'Make room for your best work.' }),
      card({ tone: 'dark', rowSpan: 3, showImage: true, imageBg: true, image: 5, showSubheading: true, showBody: true,
        subheading: 'Outdoors', heading: 'Coastal collection', body: 'Ready for a change of scenery.' }),
      card({ tone: 'lime', colSpan: 3, showHeading: false, showBody: true, body: 'Explore the full collection. Find your next favourite.' }),
    ],
  },
]

export const DEFAULT_PRESET = BUILT_IN_PRESETS[0]

// Ignore generated card IDs; compare every editable design value instead.
export function designKey(design) {
  return JSON.stringify({
    grid: [design.grid.columns, design.grid.gap, design.grid.rowHeight],
    cardStyle: [design.cardStyle.radius, design.cardStyle.padding, design.cardStyle.shadow],
    customTones: design.customTones,
    cards: design.cards.map((item) => Object.keys(CARD_DEFAULTS).map((key) => item[key])),
  })
}
