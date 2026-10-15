import { useEffect, useId, useRef, useState } from 'react'
import { BUILT_IN_PRESETS, designKey } from '../presets.js'

async function requestPresets(path = '', options) {
  const response = await fetch(`/api/presets${path}`, options)
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Unable to access saved presets.')
  return data
}

function PresetPicker({ design, presetId, onApply, onPresetIdChange }) {
  const [userPresets, setUserPresets] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const root = useRef(null)
  const trigger = useRef(null)
  const listId = useId()
  const helpId = useId()
  const nameId = useId()
  const presets = [...BUILT_IN_PRESETS, ...userPresets]
  const activeOptionId = `${listId}-${presets[activeIndex]?.id}`
  const selected = presets.find((preset) => preset.id === presetId)
  const modified = !!selected && designKey(design) !== designKey(selected)
  const ownPreset = userPresets.some((preset) => preset.id === presetId)

  useEffect(() => {
    let ignore = false
    requestPresets().then((data) => {
      if (!ignore) setUserPresets(data.presets)
    }).catch(() => {
      if (!ignore) setError('Saved presets could not be loaded. Check that the project server is running, then reload.')
    }).finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [])

  useEffect(() => {
    if (!open) return
    const closeOutside = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  useEffect(() => {
    if (open) document.getElementById(activeOptionId)?.scrollIntoView({ block: 'nearest' })
  }, [open, activeOptionId])

  const choose = (preset) => {
    onApply(preset)
    setOpen(false)
    setError('')
    setMessage(`${preset.name} applied.`)
    trigger.current?.focus()
  }

  const onKeyDown = (event) => {
    const key = event.key
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape', 'Enter', ' '].includes(key)) return
    if (key === 'Escape') {
      setOpen(false)
      event.preventDefault()
      return
    }
    if (key === 'Enter' || key === ' ') {
      if (open) choose(presets[activeIndex])
      else { setActiveIndex(Math.max(0, presets.findIndex((preset) => preset.id === presetId))); setOpen(true) }
    } else {
      const start = open ? activeIndex : Math.max(0, presets.findIndex((preset) => preset.id === presetId))
      setOpen(true)
      setActiveIndex(key === 'Home' ? 0 : key === 'End' ? presets.length - 1 : (start + (key === 'ArrowDown' ? 1 : -1) + presets.length) % presets.length)
    }
    event.preventDefault()
  }

  const save = async (update) => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const { preset } = await requestPresets(update ? `/${selected.id}` : '', {
        method: update ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...design, name: update ? selected.name : name.trim() }),
      })
      setUserPresets((previous) => update ? previous.map((item) => item.id === preset.id ? preset : item) : [...previous, preset])
      onPresetIdChange(preset.id)
      setName('')
      setMessage(`${preset.name} ${update ? 'updated' : 'saved'}.`)
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  const remove = async () => {
    if (!ownPreset) return
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await requestPresets(`/${selected.id}`, { method: 'DELETE' })
      setUserPresets((previous) => previous.filter((preset) => preset.id !== selected.id))
      onPresetIdChange(null)
      setMessage('Preset deleted. The current layout is kept.')
    } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }

  return (
    <section
      ref={root}
      className="flex min-w-0 flex-col gap-3 rounded-2xl bg-white/5 p-4"
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}
      onKeyDown={(event) => { if (event.key === 'Delete' || event.key === 'Backspace') event.stopPropagation() }}
    >
      <div>
        <p id={`${listId}-label`} className="text-xs font-medium tracking-widest text-lavender uppercase">Layout preset</p>
        <p id={helpId} className="mt-1 text-xs leading-relaxed text-white/50">Choosing a preset replaces the current layout.</p>
      </div>
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-labelledby={`${listId}-label`}
        aria-describedby={helpId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? activeOptionId : undefined}
        disabled={busy}
        onClick={() => { setActiveIndex(Math.max(0, presets.findIndex((preset) => preset.id === presetId))); setOpen(!open) }}
        onKeyDown={onKeyDown}
        className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-left text-sm text-white ring-1 ring-white/15 transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime disabled:opacity-50"
      >
        <span className="min-w-0 break-words">{selected?.name || (loading && presetId?.startsWith('user-') ? 'Loading preset…' : 'Custom layout')}{modified ? ' *' : ''}</span>
        <span aria-hidden="true" className={`shrink-0 text-lime transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {open && (
        <div id={listId} role="listbox" aria-labelledby={`${listId}-label`} className="max-h-64 shrink-0 overflow-y-auto rounded-xl bg-ink p-1.5 ring-1 ring-white/20">
          {presets.map((preset, index) => (
            <div
              key={preset.id}
              id={`${listId}-${preset.id}`}
              role="option"
              aria-selected={preset.id === presetId}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => choose(preset)}
              className={`min-h-11 cursor-pointer rounded-lg px-3 py-2.5 text-sm break-words ${index === activeIndex ? 'bg-lime text-ink' : 'text-white hover:bg-white/10'}`}
            >
              <span className="block font-medium">{preset.name}{preset.id === presetId ? ' ✓' : ''}</span>
              <span className={`mt-0.5 hidden text-xs sm:block ${index === activeIndex ? 'text-ink/70' : 'text-white/50'}`}>{index < BUILT_IN_PRESETS.length ? 'Built-in · ' : 'Saved · '}{preset.description || 'Your custom layout'}</span>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs leading-relaxed text-white/50">{modified ? '* Modified. Save as new' + (ownPreset ? ' or update your preset.' : ' to keep your changes.') : ownPreset ? 'Saved to JSON. Edit this layout to update it.' : 'Built-in presets are permanent. Save your own below.'}</p>
      <form onSubmit={(event) => { event.preventDefault(); if (name.trim() && !busy && !loading) save(false) }} className="flex min-w-0 flex-col gap-2">
        <label htmlFor={nameId} className="text-xs font-medium text-white/70">New preset name</label>
        <input id={nameId} value={name} onChange={(event) => setName(event.target.value)} maxLength={60} required placeholder="e.g. Portfolio highlights" disabled={busy || loading}
          className="min-h-11 w-full min-w-0 rounded-lg bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/35 focus-visible:outline-2 focus-visible:outline-lime disabled:opacity-50" />
        <button type="submit" disabled={!name.trim() || busy || loading} className="min-h-11 rounded-full bg-lime px-4 py-2 text-sm font-medium text-ink hover:bg-lime/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime disabled:opacity-40">Save as new preset</button>
      </form>
      {ownPreset && (
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => save(true)} disabled={!modified || busy || loading} className="min-h-11 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-lime disabled:opacity-40">Update preset</button>
          <button type="button" onClick={remove} disabled={busy || loading} className="min-h-11 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-400/20 focus-visible:outline-2 focus-visible:outline-lime disabled:opacity-40">Delete preset</button>
        </div>
      )}
      <div role="status" aria-live="polite" className="text-xs leading-relaxed">
        {loading && <p className="text-white/50">Loading saved presets…</p>}
        {busy && <p className="text-white/50">Saving changes…</p>}
        {message && <p className="text-lime">{message}</p>}
        {error && <p className="text-red-300">{error}</p>}
      </div>
    </section>
  )
}

export default PresetPicker
