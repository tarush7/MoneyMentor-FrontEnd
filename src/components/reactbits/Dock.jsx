import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function joinClasses(...values) {
  return values.filter(Boolean).join(' ')
}

function matchesRoute(pathname, to) {
  if (to === '/') return pathname === '/'
  return pathname === to || pathname.startsWith(`${to}/`)
}

function setDockItemTransform(node, scale, lift) {
  if (!node) return
  node.style.transform = `translate3d(0, ${-lift}px, 0) scale(${scale})`
}

const dockPanelStyle = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
  WebkitBackdropFilter: 'blur(12px) saturate(1.8) brightness(1.2)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: `inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
              inset 0 -1px 0 0 rgba(255, 255, 255, 0.1),
              0 30px 80px rgba(0, 0, 0, 0.45)`,
}

function DockItem({ item, pathname, baseItemSize, magnification, registerItemRef }) {
  const isActive = matchesRoute(pathname, item.to)

  return (
    <div
      ref={(node) => registerItemRef(item.to, node)}
      className="group relative flex flex-col items-center justify-end"
      style={{ width: `${magnification}px` }}
    >
      <span
        className={joinClasses(
          'pointer-events-none absolute -top-11 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] opacity-0 translate-y-2 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100',
          isActive
            ? 'border-cyan-200/30 bg-cyan-200/12 text-cyan-100'
            : 'border-white/12 bg-[#090416]/90 text-white/64'
        )}
      >
        {item.label}
      </span>

      <Link
        to={item.to}
        aria-label={item.label}
        className={joinClasses(
          'relative flex items-center justify-center rounded-[1.35rem] border transition-[transform,background-color,border-color,box-shadow] duration-200 will-change-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-100/70',
          isActive
            ? 'border-cyan-200/35 bg-cyan-100 text-slate-950 shadow-[0_18px_36px_rgba(125,211,252,0.22)]'
            : 'border-white/10 bg-[linear-gradient(180deg,rgba(9,12,29,0.96)_0%,rgba(5,7,18,0.98)_100%)] text-white shadow-[0_18px_38px_rgba(0,0,0,0.34)] hover:border-white/18 hover:bg-[linear-gradient(180deg,rgba(12,15,34,0.98)_0%,rgba(6,8,19,0.98)_100%)]'
        )}
        style={{
          width: `${baseItemSize}px`,
          height: `${baseItemSize}px`,
        }}
      >
        <span className="pointer-events-none">{item.icon}</span>
      </Link>
    </div>
  )
}

export default function Dock({
  items,
  className = '',
  baseItemSize = 56,
  magnification = 76,
  distance = 140,
}) {
  const { pathname } = useLocation()
  const panelRef = useRef(null)
  const itemRefs = useRef(new Map())
  const centersRef = useRef(new Map())
  const pointerXRef = useRef(Infinity)
  const pointerInsideRef = useRef(false)
  const frameRef = useRef(0)

  const measureCenters = () => {
    const nextCenters = new Map()

    items.forEach((item) => {
      const node = itemRefs.current.get(item.to)
      if (!node) return

      const rect = node.getBoundingClientRect()
      nextCenters.set(item.to, rect.left + rect.width / 2)
    })

    centersRef.current = nextCenters
  }

  const applyTransforms = () => {
    frameRef.current = 0

    items.forEach((item) => {
      const node = itemRefs.current.get(item.to)?.querySelector('a')
      if (!node) return

      const centerX = centersRef.current.get(item.to) ?? 0
      const proximity = pointerInsideRef.current
        ? clamp(1 - Math.abs(pointerXRef.current - centerX) / distance, 0, 1)
        : 0
      const scale = 1 + ((magnification - baseItemSize) / baseItemSize) * proximity
      const lift = proximity * 14

      setDockItemTransform(node, scale, lift)
    })
  }

  const scheduleFrame = () => {
    if (frameRef.current) return
    frameRef.current = window.requestAnimationFrame(applyTransforms)
  }

  useEffect(() => {
    const panelNode = panelRef.current
    if (!panelNode) return undefined

    const resizeObserver = new ResizeObserver(() => {
      measureCenters()
      scheduleFrame()
    })

    resizeObserver.observe(panelNode)
    window.addEventListener('resize', measureCenters)
    window.addEventListener('scroll', measureCenters, { passive: true })

    measureCenters()
    applyTransforms()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', measureCenters)
      window.removeEventListener('scroll', measureCenters)

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [items, baseItemSize, magnification, distance])

  return (
    <div
      className={joinClasses('pointer-events-none fixed inset-x-0 bottom-4 z-50 px-4', className)}
    >
      <div className="mx-auto flex w-full max-w-fit justify-center">
        <div
          ref={panelRef}
          className="pointer-events-auto flex items-end gap-3 rounded-[2rem] px-4 pb-3 pt-4"
          style={dockPanelStyle}
          onMouseMove={(event) => {
            pointerXRef.current = event.clientX
            pointerInsideRef.current = true
            scheduleFrame()
          }}
          onMouseLeave={() => {
            pointerInsideRef.current = false
            pointerXRef.current = Infinity
            scheduleFrame()
          }}
          role="toolbar"
          aria-label="Application dock"
        >
          {items.map((item) => (
            <DockItem
              key={item.to}
              item={item}
              pathname={pathname}
              baseItemSize={baseItemSize}
              magnification={magnification}
              registerItemRef={(key, node) => {
                if (node) {
                  itemRefs.current.set(key, node)
                } else {
                  itemRefs.current.delete(key)
                  centersRef.current.delete(key)
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
