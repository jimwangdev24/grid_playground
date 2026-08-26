import { IMAGES } from './theme.js'

// Curated copy + tone pools so one click lands on something coherent,
// not uniform noise: always one hero card, white-heavy tones, headings on.
const COPY = [
  { subheading: 'More offers', heading: 'There is something else for you', body: 'Small upgrades that change your whole day.' },
  { subheading: 'From the lab', heading: 'View our blog', body: 'Stories, reviews, and deep dives from the team.' },
  { subheading: 'New arrivals', heading: 'Built for the way you work', body: 'Thoughtful hardware that keeps up with your flow.' },
  { subheading: 'Pocket-size nostalgia', heading: 'Classic gaming, modern feel', body: 'Relive iconic titles with smooth controls and sharp visuals.' },
  { subheading: 'Meet the lineup', heading: 'Small devices, big personality', body: 'Compact designs that keep you connected and informed.' },
  { subheading: 'Have some questions?', heading: 'Contact us', body: 'Real humans, fast answers — usually within a day.' },
  { subheading: 'Discover our history', heading: 'About us', body: 'A decade of building tools people actually enjoy.' },
  { subheading: 'Power your play', heading: 'Essential accessories', body: 'Designed to keep your setup running strong.' },
  { subheading: 'Say hello', heading: 'Smart living starts here', body: 'A compact display that keeps you in the loop.' },
]

const TONE_POOL = ['white', 'white', 'white', 'dark', 'lavender', 'lime', '#ff8552', '#7cc6fe', '#ffd166']
const HERO_TONES = ['dark', 'dark', 'lavender', '#ff8552']

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const chance = (p) => Math.random() < p
const randInt = (n) => Math.floor(Math.random() * n)

// Returns card overrides (no ids) for App's makeCard to instantiate.
export function randomLayout() {
  const copy = [...COPY].sort(() => Math.random() - 0.5)

  const hero = {
    ...copy[0],
    tone: pick(HERO_TONES),
    colSpan: 2,
    rowSpan: 2,
    image: randInt(IMAGES.length),
    showImage: true,
    imageBg: chance(0.7),
    showHeading: true,
    showSubheading: true,
    showBody: chance(0.3),
  }

  const rest = Array.from({ length: 4 + randInt(3) }, (_, i) => {
    const showImage = chance(0.5)
    return {
      ...copy[(i + 1) % copy.length],
      tone: pick(TONE_POOL),
      colSpan: chance(0.25) ? 2 : 1,
      rowSpan: 1,
      image: randInt(IMAGES.length),
      showImage,
      imageBg: showImage && chance(0.35),
      showHeading: true,
      showSubheading: chance(0.7),
      showBody: chance(0.35),
    }
  })

  return [hero, ...rest]
}
