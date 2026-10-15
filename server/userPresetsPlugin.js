import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { CARD_DEFAULTS, BUILT_IN_PRESETS } from '../src/presets.js'

const fail = (message, status = 400) => Object.assign(new Error(message), { status })
const hex = (value) => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
const numberIn = (value, min, max) => Number.isInteger(value) && value >= min && value <= max

function validatePreset(input) {
  if (!input || typeof input !== 'object') throw fail('Invalid preset.')
  const name = typeof input.name === 'string' ? input.name.trim() : ''
  if (!name || name.length > 60) throw fail('Use a preset name between 1 and 60 characters.')
  const { grid, cardStyle, cards, customTones } = input
  if (!grid || !numberIn(grid.columns, 1, 12) || !numberIn(grid.gap, 0, 48) || !numberIn(grid.rowHeight, 80, 240)) throw fail('Invalid grid settings.')
  if (!cardStyle || !numberIn(cardStyle.radius, 0, 40) || !numberIn(cardStyle.padding, 8, 48) || !numberIn(cardStyle.shadow, 0, 3)) throw fail('Invalid card styles.')
  if (!Array.isArray(customTones) || !customTones.every(hex) || !Array.isArray(cards)) throw fail('Invalid card data.')
  const cleanCards = cards.map((item) => {
    if (!item || !numberIn(item.colSpan, 1, 12) || !numberIn(item.rowSpan, 1, 4) || !numberIn(item.image, 0, 5)) throw fail('Invalid card settings.')
    if (!['white', 'dark', 'lavender', 'lime'].includes(item.tone) && !hex(item.tone)) throw fail('Invalid card color.')
    for (const [key, fallback] of Object.entries(CARD_DEFAULTS)) {
      if (typeof item[key] !== typeof fallback) throw fail('Invalid card content.')
    }
    return Object.fromEntries(Object.keys(CARD_DEFAULTS).map((key) => [key, item[key]]))
  })
  return {
    name, grid: { columns: grid.columns, gap: grid.gap, rowHeight: grid.rowHeight },
    cardStyle: { radius: cardStyle.radius, padding: cardStyle.padding, shadow: cardStyle.shadow },
    customTones: [...new Set(customTones)], cards: cleanCards,
  }
}

export function userPresetsPlugin({ filePath } = {}) {
  let file
  let writes = Promise.resolve()
  const load = async () => {
    try {
      const data = JSON.parse(await readFile(file, 'utf8'))
      if (!Array.isArray(data.presets)) throw new Error('Invalid preset file')
      return data.presets.map((preset) => {
        if (!/^user-[0-9a-f-]+$/.test(preset.id)) throw new Error('Invalid preset ID')
        return { id: preset.id, ...validatePreset(preset) }
      })
    } catch (error) {
      if (error.code === 'ENOENT') return []
      throw fail('The user preset JSON file could not be read. Existing presets were not changed.', 500)
    }
  }
  const store = async (presets) => {
    await mkdir(dirname(file), { recursive: true })
    const temporary = `${file}.tmp`
    await writeFile(temporary, `${JSON.stringify({ version: 1, presets }, null, 2)}\n`, 'utf8')
    await rename(temporary, file)
  }
  const readBody = async (request) => {
    const chunks = []
    let size = 0
    for await (const chunk of request) {
      size += chunk.length
      if (size > 1024 * 1024) throw fail('Preset is too large to save.', 413)
      chunks.push(chunk)
    }
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) }
    catch { throw fail('Invalid JSON request.') }
  }
  const middleware = async (request, response, next) => {
    const pathname = new URL(request.url, 'http://localhost').pathname
    if (pathname !== '/api/presets' && !pathname.startsWith('/api/presets/')) return next()
    const send = (status, body) => {
      response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      response.end(JSON.stringify(body))
    }
    try {
      // Only same-origin JSON requests may write the local preset file.
      if (request.method !== 'GET') {
        if (request.headers.origin && new URL(request.headers.origin).host !== request.headers.host) throw fail('Cross-origin writes are not allowed.', 403)
        if (request.method !== 'DELETE' && !request.headers['content-type']?.startsWith('application/json')) throw fail('Use a JSON request.', 415)
      }
      if (request.method === 'GET' && pathname === '/api/presets') {
        await writes
        return send(200, { presets: await load() })
      }
      const id = pathname.slice('/api/presets/'.length)
      if (request.method !== 'POST' || pathname !== '/api/presets') {
        if (BUILT_IN_PRESETS.some((preset) => preset.id === id)) throw fail('Built-in presets cannot be updated or deleted.', 403)
        if (!/^user-[0-9a-f-]+$/.test(id)) throw fail('Preset not found.', 404)
      }
      if (request.method === 'POST' && pathname !== '/api/presets') throw fail('Method not allowed.', 405)
      if (!['POST', 'PUT', 'DELETE'].includes(request.method)) throw fail('Method not allowed.', 405)
      const values = request.method === 'DELETE' ? null : validatePreset(await readBody(request))
      const operation = writes.then(async () => {
        const presets = await load()
        if (values && (BUILT_IN_PRESETS.some((preset) => preset.name.toLowerCase() === values.name.toLowerCase()) || presets.some((preset) => preset.id !== id && preset.name.toLowerCase() === values.name.toLowerCase()))) throw fail('A preset with that name already exists.', 409)
        let preset
        if (request.method === 'POST') {
          preset = { id: `user-${randomUUID()}`, ...values }
          presets.push(preset)
        } else {
          const index = presets.findIndex((item) => item.id === id)
          if (index < 0) throw fail('Preset not found.', 404)
          if (request.method === 'DELETE') presets.splice(index, 1)
          else { preset = { id, ...values }; presets[index] = preset }
        }
        await store(presets)
        send(request.method === 'POST' ? 201 : 200, preset ? { preset } : { deleted: id })
      })
      writes = operation.catch(() => {})
      await operation
    } catch (error) {
      send(error.status || 500, { error: error.status ? error.message : 'Unable to save presets. Try again.' })
    }
  }
  return {
    name: 'user-presets-json',
    configResolved(config) { file = filePath || join(config.root, 'data', 'user-presets.json') },
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) },
  }
}
