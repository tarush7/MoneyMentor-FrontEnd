// Adapted from React Bits: https://reactbits.dev/micro/glide-select
// Copyright (c) 2026 David Haz. See OptionWheel.LICENSE.md.
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import './GlideSelect.css'

const SIZES = { sm: { chip: 28, row: 26, font: 12 }, md: { chip: 32, row: 30, font: 13 }, lg: { chip: 44, row: 40, font: 14 } }
const DEFAULT_OPTIONS = ['One', 'Two', 'Three']
const normalize = (option) => typeof option === 'string' ? { value: option, label: option } : option

function Icon({ check = false }) {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={check ? 'm5 12 4 4L19 6' : 'm6 9 6 6 6-6'} />
    </svg>
  )
}

export default function GlideSelect({
  options = DEFAULT_OPTIONS, value, defaultValue, onChange,
  placeholder = 'Select', accentColor = '#cffafe', surfaceColor = '#191d2b',
  highlightColor = '#283341', textColor = '#f5f5f5', size = 'lg', radius = 12,
  menuWidth = 176, placement = 'bottom', align = 'left', popDuration = 180,
  glideDuration = 220, rememberPosition = true, disabled = false,
  ariaLabel = 'Select', className = '', triggerClassName = '',
  triggerLabel, menuContent, open: controlledOpen, onOpenChange, triggerElementRef,
  viewportPadding = 12,
}) {
  const items = options.map(normalize)
  const [inner, setInner] = useState(defaultValue ?? '')
  const current = value ?? inner
  const selected = items.findIndex((item) => item.value === current)
  const [innerPhase, setInnerPhase] = useState('closed')
  const phase = controlledOpen === undefined ? innerPhase : controlledOpen ? 'open' : 'closed'
  const [active, setActive] = useState(null)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const pillRef = useRef(null)
  const instantRef = useRef(false)
  const closeTimerRef = useRef(null)
  const scrubRef = useRef(null)
  const closeRef = useRef(null)
  const id = useId()
  const dimensions = SIZES[size] ?? SIZES.lg
  const step = dimensions.row + 1
  const popOut = Math.round(popDuration * 2 / 3)

  function setPhase(next) {
    setInnerPhase(next)
    onOpenChange?.(next === 'open')
  }

  function open(viaKey = false) {
    if (disabled) return
    clearTimeout(closeTimerRef.current)
    instantRef.current = true
    setActive(selected >= 0 ? selected : viaKey ? 0 : null)
    setPhase('open')
  }

  function close(animate = false, restoreFocus = false) {
    setActive(null)
    clearTimeout(closeTimerRef.current)
    if (animate && menuRef.current) {
      menuRef.current.dataset.state = 'closed'
      setPhase('closing')
      closeTimerRef.current = setTimeout(() => setPhase('closed'), popOut + 20)
    } else setPhase('closed')
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true })
  }

  useEffect(() => { closeRef.current = close })

  useEffect(() => {
    if (phase !== 'open') return
    function onOutside(event) {
      if (!rootRef.current?.contains(event.target)) closeRef.current?.(true)
    }
    document.addEventListener('pointerdown', onOutside, true)
    return () => document.removeEventListener('pointerdown', onOutside, true)
  }, [phase])

  useEffect(() => () => clearTimeout(closeTimerRef.current), [])

  useLayoutEffect(() => {
    if (phase !== 'open') return
    const menu = menuRef.current
    const trigger = triggerRef.current
    if (!menu || !trigger) return
    const rect = trigger.getBoundingClientRect()
    const bottomSpace = window.innerHeight - rect.bottom - viewportPadding
    const topSpace = rect.top - viewportPadding
    const side = menuContent ? placement : bottomSpace < menu.scrollHeight + 6 && topSpace > bottomSpace ? 'top' : placement
    menu.dataset.side = side
    menu.style.transformOrigin = `${side === 'bottom' ? 'top' : 'bottom'} ${align}`
    if (!menuContent) menu.style.maxHeight = `${Math.max(80, (side === 'bottom' ? bottomSpace : topSpace) - 6)}px`
    menu.dataset.state = 'closed'
    void menu.offsetHeight
    menu.dataset.state = 'open'
    if (menuContent) {
      menu.querySelector('[role="listbox"]')?.focus({ preventScroll: true })
      if (menu.getBoundingClientRect().bottom > window.innerHeight - 112) menu.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    }
    // Opening geometry is measured once; selection updates keep the panel in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  useLayoutEffect(() => {
    const pill = pillRef.current
    if (!pill || phase !== 'open') return
    if (active === null) { pill.style.opacity = '0'; return }
    pill.style.transitionDuration = instantRef.current || pill.style.opacity !== '1' ? '0ms, 150ms' : ''
    pill.style.transform = `translateY(${active * step}px)`
    pill.style.opacity = '1'
    instantRef.current = false
    menuRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }, [active, phase, step])

  function pick(index) {
    const item = items[index]
    if (!item) return
    if (item.value !== current) {
      if (value === undefined) setInner(item.value)
      onChange?.(item.value, item)
    }
    close(false, true)
  }

  function onTriggerKey(event) {
    const key = event.key
    if (phase !== 'open') {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(key)) { event.preventDefault(); open(true) }
      return
    }
    if (menuContent) return
    const index = active ?? Math.max(0, selected)
    function go(next) { event.preventDefault(); instantRef.current = true; setActive(Math.max(0, Math.min(items.length - 1, next))) }
    if (key === 'ArrowDown' || key === 'ArrowUp') go(index + (key === 'ArrowDown' ? 1 : -1))
    else if (key === 'Home' || key === 'End') go(key === 'Home' ? 0 : items.length - 1)
    else if (key === 'Enter' || key === ' ') { event.preventDefault(); pick(index) }
    else if (key === 'Tab') close()
    else if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      for (let offset = 1; offset <= items.length; offset++) {
        const next = (index + offset) % items.length
        if (String(items[next].label).toLowerCase().startsWith(key.toLowerCase())) { go(next); break }
      }
    }
  }

  function rowAt(y) {
    const scrub = scrubRef.current
    if (!scrub) return null
    const index = Math.floor((y - scrub.top + (menuRef.current?.scrollTop ?? 0)) / step)
    return index >= 0 && index < items.length ? index : null
  }

  return (
    <div
      ref={rootRef}
      className={`glide-select ${className}`}
      style={{ '--gs-accent': accentColor, '--gs-surface': surfaceColor, '--gs-highlight': highlightColor, '--gs-text': textColor, '--gs-radius': `${radius}px`, '--gs-chip': `${dimensions.chip}px`, '--gs-row': `${dimensions.row}px`, '--gs-font': `${dimensions.font}px`, '--gs-menu-w': `${menuWidth}px`, '--gs-pop': `${popDuration}ms`, '--gs-pop-out': `${popOut}ms`, '--gs-glide': `${glideDuration}ms` }}
      onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) close() }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && phase === 'open') {
          event.preventDefault()
          event.stopPropagation()
          close(false, true)
        }
      }}
    >
      <button
        ref={(node) => {
          triggerRef.current = node
          if (triggerElementRef) triggerElementRef.current = node
        }}
        type="button"
        role={menuContent ? undefined : 'combobox'}
        aria-haspopup={menuContent ? 'dialog' : 'listbox'}
        aria-expanded={phase === 'open'}
        aria-controls={`${id}-list`}
        aria-activedescendant={!menuContent && active !== null ? `${id}-${active}` : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`glide-select-trigger ${triggerClassName}`}
        onClick={() => { if (phase === 'open') close(true); else open() }}
        onKeyDown={onTriggerKey}
      >
        <span key={current} className="glide-select-label">{triggerLabel ?? (selected >= 0 ? items[selected].label : placeholder)}</span>
        <span className="glide-select-chevron"><Icon /></span>
      </button>
      {phase !== 'closed' ? (
        <div ref={menuRef} className={`glide-select-menu ${menuContent ? 'glide-select-custom' : ''}`} data-state="open" data-side={placement} data-align={align}>
          {menuContent ? (
            <div id={`${id}-list`} role="dialog" aria-label={ariaLabel}>
              {menuContent}
            </div>
          ) : (
            <div
              id={`${id}-list`} role="listbox" aria-label={ariaLabel} className="glide-select-list"
              onPointerOver={(event) => {
                if (event.pointerType === 'touch' || scrubRef.current) return
                const row = event.target.closest('[data-index]')
                if (row) setActive(Number(row.dataset.index))
              }}
              onPointerLeave={() => { if (!scrubRef.current && !rememberPosition) setActive(null) }}
              onPointerDown={(event) => {
                if (event.button !== 0 || scrubRef.current) return
                event.currentTarget.setPointerCapture(event.pointerId)
                scrubRef.current = { id: event.pointerId, top: event.currentTarget.getBoundingClientRect().top + (menuRef.current?.scrollTop ?? 0) }
                instantRef.current = true
                setActive(rowAt(event.clientY))
              }}
              onPointerMove={(event) => { if (scrubRef.current?.id === event.pointerId) setActive(rowAt(event.clientY)) }}
              onPointerUp={(event) => {
                if (scrubRef.current?.id !== event.pointerId) return
                const index = rowAt(event.clientY)
                scrubRef.current = null
                if (index !== null) pick(index)
              }}
              onPointerCancel={() => { scrubRef.current = null }}
              onLostPointerCapture={() => { scrubRef.current = null }}
            >
              <span ref={pillRef} aria-hidden="true" className="glide-select-highlight" />
              {items.map((item, index) => (
                <div key={item.value} id={`${id}-${index}`} role="option" aria-selected={index === selected} data-index={index} className="glide-select-option">
                  <span>{item.label}</span>
                  {index === selected ? <Icon check /> : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
