import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtemp, readFile, readdir, rmdir, unlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { BUILT_IN_PRESETS, CARD_DEFAULTS, DEFAULT_PRESET, designKey } from '../src/presets.js'
import { userPresetsPlugin } from '../server/userPresetsPlugin.js'

async function withStore(run) {
  const directory = await mkdtemp(join(tmpdir(), 'grid-presets-test-'))
  const file = join(directory, 'presets.json')
  const plugin = userPresetsPlugin({ filePath: file })
  plugin.configResolved({ root: directory })
  let middleware
  plugin.configureServer({ middlewares: { use(handler) { middleware = handler } } })
  const server = createServer((request, response) => middleware(request, response, () => { response.writeHead(404); response.end() }))
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const request = async (path = '', method = 'GET', body) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/presets${path}`, {
      method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body),
    })
    return { status: response.status, data: await response.json() }
  }
  try { await run({ request, file }) }
  finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
    for (const name of await readdir(directory)) await unlink(join(directory, name))
    await rmdir(directory)
  }
}

const snapshot = (name = 'My layout') => ({ ...structuredClone(DEFAULT_PRESET), name })

test('exactly three distinct built-in presets, with Bento as the default', () => {
  assert.equal(BUILT_IN_PRESETS.length, 3)
  assert.equal(new Set(BUILT_IN_PRESETS.map((preset) => preset.id)).size, 3)
  assert.equal(DEFAULT_PRESET.id, 'bento')
  for (const preset of BUILT_IN_PRESETS) {
    for (const card of preset.cards) assert.deepEqual(Object.keys(card).sort(), Object.keys(CARD_DEFAULTS).sort())
  }
})

test('modification detection ignores generated IDs and notices every editable field', () => {
  const original = snapshot()
  const withIds = structuredClone(original)
  withIds.cards.forEach((card, index) => { card.id = index + 400 })
  assert.equal(designKey(original), designKey(withIds))
  const mutations = [
    ...Object.keys(original.grid).map((key) => (design) => { design.grid[key]++ }),
    ...Object.keys(original.cardStyle).map((key) => (design) => { design.cardStyle[key]++ }),
    ...Object.keys(CARD_DEFAULTS).map((key) => (design) => {
      const value = design.cards[0][key]
      design.cards[0][key] = typeof value === 'boolean' ? !value : typeof value === 'number' ? value + 1 : `${value} changed`
    }),
    (design) => design.cards.reverse(), (design) => design.cards.pop(),
    (design) => design.cards.push({ ...CARD_DEFAULTS }), (design) => design.customTones.push('#123456'),
  ]
  for (const mutate of mutations) {
    const changed = structuredClone(original)
    mutate(changed)
    assert.notEqual(designKey(original), designKey(changed))
  }
})

test('create, read, update and delete persist to JSON; built-ins stay protected', async () => {
  await withStore(async ({ request, file }) => {
    assert.deepEqual((await request()).data.presets, [])
    const created = await request('', 'POST', snapshot())
    assert.equal(created.status, 201)
    const id = created.data.preset.id
    assert.match(id, /^user-/)
    assert.equal(JSON.parse(await readFile(file, 'utf8')).presets[0].id, id)
    assert.equal((await request()).data.presets[0].name, 'My layout')
    const changed = snapshot()
    changed.cards[0].heading = 'An updated heading'
    assert.equal((await request(`/${id}`, 'PUT', changed)).status, 200)
    assert.equal(JSON.parse(await readFile(file, 'utf8')).presets[0].cards[0].heading, 'An updated heading')
    for (const preset of BUILT_IN_PRESETS) {
      assert.equal((await request(`/${preset.id}`, 'PUT', snapshot())).status, 403)
      assert.equal((await request(`/${preset.id}`, 'DELETE')).status, 403)
    }
    assert.equal((await request(`/${id}`, 'DELETE')).status, 200)
    assert.deepEqual(JSON.parse(await readFile(file, 'utf8')).presets, [])
  })
})

test('all built-in designs can be saved; invalid settings and duplicate names are rejected', async () => {
  await withStore(async ({ request }) => {
    for (const preset of BUILT_IN_PRESETS) {
      assert.equal((await request('', 'POST', { ...preset, name: `Copy of ${preset.name}` })).status, 201)
    }
    assert.equal((await request('', 'POST', snapshot('Bento Showcase'))).status, 409)
    assert.equal((await request('', 'POST', snapshot('Copy of Bento Showcase'))).status, 409)
    assert.equal((await request('', 'POST', snapshot('  '))).status, 400)
    const invalid = snapshot()
    invalid.grid.columns = 99
    assert.equal((await request('', 'POST', invalid)).status, 400)
    assert.equal((await request()).data.presets.length, 3)
  })
})

test('concurrent saves preserve both presets and an unreadable JSON file is not overwritten', async () => {
  await withStore(async ({ request, file }) => {
    const saves = await Promise.all([request('', 'POST', snapshot('First')), request('', 'POST', snapshot('Second'))])
    assert.deepEqual(saves.map((result) => result.status), [201, 201])
    assert.equal((await request()).data.presets.length, 2)
    await writeFile(file, 'invalid JSON', 'utf8')
    assert.equal((await request()).status, 500)
    assert.equal((await request('', 'POST', snapshot('Third'))).status, 500)
    assert.equal(await readFile(file, 'utf8'), 'invalid JSON')
  })
})
