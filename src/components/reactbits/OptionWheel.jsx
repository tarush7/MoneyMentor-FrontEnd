// Adapted from React Bits: https://reactbits.dev/components/option-wheel
// Copyright (c) 2026 David Haz. See OptionWheel.LICENSE.md.

import { useRef, useState, useCallback, useEffect, useId } from 'react';

const DEFAULT_ITEMS = [
  'Ambient',
  'House',
  'Techno',
  'Jazz',
  'Lo-Fi',
  'Synthwave',
  'Trance',
  'Funk',
  'Disco',
  'Hip-Hop',
  'Chillwave',
  'Drum & Bass'
];

const OptionWheel = ({
  items = DEFAULT_ITEMS,
  defaultSelected = 3,
  onChange,
  onSelect,
  // Opt in to committing after input stops and the wheel reaches its snapped row.
  selectOnSettle = false,
  settleDelay = 180,
  textColor = '#a6a6a6',
  activeColor = '#ffffff',
  side = 'left',
  fontSize = 3,
  spacing = 1.4,
  curve = 1,
  tilt = 6,
  blur = 2,
  fade = 0.25,
  minOpacity = 0.05,
  smoothing = 200,
  inset = 80,
  loop = false,
  draggable = true,
  soundUrl = '',
  soundVolume = 0.5,
  className = '',
  ariaLabel = 'Option wheel',
  visibleItems = 5
}) => {
  const rootRef = useRef(null);
  const itemRefs = useRef([]);
  const posRef = useRef(defaultSelected);
  const targetRef = useRef(defaultSelected);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const cfgRef = useRef({});
  const onChangeRef = useRef(onChange);
  const onSelectRef = useRef(onSelect);
  const selectedRef = useRef(defaultSelected);
  const displayedRef = useRef(defaultSelected);
  const committedRef = useRef(defaultSelected);
  const pendingSelectionRef = useRef(false);
  const readyToSelectRef = useRef(false);
  const directionRef = useRef(0);
  const wheelTimerRef = useRef(null);
  const dragRef = useRef(null);
  const dragMovedRef = useRef(false);
  const audioRef = useRef(null);
  const audioUrlRef = useRef('');
  const lastTickRef = useRef(0);
  const optionId = useId();
  const reducedMotionRef = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => { reducedMotionRef.current = preference.matches; };
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    const remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    onChangeRef.current = onChange;
    onSelectRef.current = onSelect;
    cfgRef.current = {
      count: items.length,
      items,
      rowH: Math.max(fontSize * spacing * remPx, 1),
      curve,
      tilt,
      blur,
      fade,
      minOpacity,
      side,
      loop,
      smoothing,
      draggable,
      soundUrl,
      soundVolume,
      visibleItems,
      selectOnSettle,
      settleDelay: Math.max(0, settleDelay)
    };
  }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, side, loop, smoothing, draggable, soundUrl, soundVolume, visibleItems, onChange, onSelect, selectOnSettle, settleDelay]);

  // Single rAF loop that eases the wheel position toward its target with
  // frame-rate independent exponential smoothing, then lays every option out
  // along the curve based on its distance from the current position.
  const runFrame = useCallback(function animateFrame(now) {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const cfg = cfgRef.current;
    const distance = Math.abs(targetRef.current - posRef.current);
    const smoothingMs = cfg.selectOnSettle
      ? readyToSelectRef.current ? Math.min(cfg.smoothing, 40) : cfg.smoothing / Math.max(1, Math.min(distance, 4))
      : cfg.smoothing;
    const tau = Math.max(smoothingMs, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    const target = targetRef.current;
    const cur = posRef.current;
    let next = reducedMotionRef.current ? target : cur + (target - cur) * k;
    const settled = Math.abs(target - next) < (cfg.selectOnSettle ? 0.005 : 0.001);
    if (settled) next = target;
    posRef.current = next;

    const els = itemRefs.current;
    const n = cfg.count;
    if (cfg.selectOnSettle && n > 0) {
      const centeredIndex = ((Math.round(next) % n) + n) % n;
      if (centeredIndex !== displayedRef.current) {
        displayedRef.current = centeredIndex;
        setSelectedIndex(centeredIndex);
        onChangeRef.current?.(centeredIndex, cfg.items[centeredIndex]);
      }
    }
    const mirror = cfg.side === 'right' ? -1 : 1;
    // Options sit on a circle whose radius keeps the arc length between two
    // neighbors equal to one row height, so tilt controls how tightly it curls.
    const tiltRad = (cfg.tilt * Math.PI) / 180;
    const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;
    for (let i = 0; i < n; i++) {
      const el = els[i];
      if (!el) continue;
      let d = i - next;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }
      const dist = Math.abs(d);
      el.style.visibility = dist < cfg.visibleItems / 2 ? 'visible' : 'hidden';
      let x = 0;
      let y = d * cfg.rowH;
      let rot = 0;
      if (R > 0) {
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
        y = R * Math.sin(ang);
        x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve;
        rot = (mirror * ang * 180) / Math.PI;
      }
      el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
      el.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade));
      el.style.filter = cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : 'none';
      el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
    }

    rafRef.current = settled ? null : requestAnimationFrame(animateFrame);
    if (settled && cfg.selectOnSettle && pendingSelectionRef.current && readyToSelectRef.current && !dragRef.current && n > 0) {
      pendingSelectionRef.current = false;
      readyToSelectRef.current = false;
      directionRef.current = 0;
      const index = ((Math.round(target) % n) + n) % n;
      if (committedRef.current !== index) {
        committedRef.current = index;
        onSelectRef.current?.(index, cfg.items[index]);
      }
    }
  }, []);

  const startLoop = useCallback(() => {
    // New input changes the destination without starving the next animation frame.
    if (rafRef.current != null) return;
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  // Optional tick on selection change, throttled so fast scrolling can't spam
  // it, and with playback failures (e.g. autoplay policies) silently ignored.
  const playTick = useCallback(() => {
    const { soundUrl, soundVolume } = cfgRef.current;
    if (!soundUrl) return;
    const now = performance.now();
    if (now - lastTickRef.current < 70) return;
    lastTickRef.current = now;
    if (!audioRef.current || audioUrlRef.current !== soundUrl) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.preload = 'auto';
      audioUrlRef.current = soundUrl;
    }
    const audio = audioRef.current;
    audio.volume = Math.min(Math.max(soundVolume, 0), 1);
    audio.currentTime = 0;
    audio.play()?.catch(() => {});
  }, []);

  const applyTarget = useCallback(
    (value, snap) => {
      const cfg = cfgRef.current;
      if (!cfg.count) return;
      let v = value;
      if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0));
      if (snap) v = Math.round(v);
      targetRef.current = v;
      const idx = ((Math.round(v) % cfg.count) + cfg.count) % cfg.count;
      if (idx !== selectedRef.current) {
        selectedRef.current = idx;
        if (!cfg.selectOnSettle) {
          displayedRef.current = idx;
          setSelectedIndex(idx);
          onChangeRef.current?.(idx, cfg.items[idx]);
        }
        playTick();
      }
      startLoop();
    },
    [startLoop, playTick]
  );

  const cancelSettlement = useCallback(() => {
    clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = null;
    pendingSelectionRef.current = false;
    readyToSelectRef.current = false;
  }, []);

  const scheduleSettlement = useCallback((delay) => {
    cancelSettlement();
    pendingSelectionRef.current = cfgRef.current.selectOnSettle;
    wheelTimerRef.current = setTimeout(() => {
      wheelTimerRef.current = null;
      if (dragRef.current) return;
      readyToSelectRef.current = true;
      applyTarget(targetRef.current, true);
    }, delay ?? (cfgRef.current.selectOnSettle ? cfgRef.current.settleDelay : 140));
  }, [applyTarget, cancelSettlement]);

  // Wheel / touchpad scrolling, registered manually so it can be non-passive.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = e => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY) || dragRef.current) return;
      if (!e.deltaY) return;
      e.preventDefault();
      const cfg = cfgRef.current;
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaMode === 2 ? e.deltaY * el.clientHeight : e.deltaY;
      // Automatic mode preserves large bursts. A normal 100px mouse notch is one row;
      // fractional touchpad movement accumulates instead of being discarded.
      const step = cfg.selectOnSettle ? delta / (e.deltaMode === 1 ? 72 : 100) : Math.max(-1, Math.min(1, delta / cfg.rowH));
      const direction = Math.sign(step);
      const reversed = cfg.selectOnSettle && directionRef.current && directionRef.current !== direction;
      const origin = reversed ? posRef.current : targetRef.current;
      directionRef.current = direction;
      cancelSettlement();
      applyTarget(origin + step, false);
      scheduleSettlement();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [applyTarget, cancelSettlement, scheduleSettlement]);

  const handlePointerDown = useCallback(e => {
    if (!cfgRef.current.draggable || e.button !== 0) return;
    cancelSettlement();
    directionRef.current = 0;
    rootRef.current?.focus({ preventScroll: true });
    dragRef.current = { y: e.clientY, start: cfgRef.current.selectOnSettle ? posRef.current : targetRef.current, id: e.pointerId };
    dragMovedRef.current = false;
    setIsDragging(true);
  }, [cancelSettlement]);

  const handlePointerMove = useCallback(
    e => {
      const drag = dragRef.current;
      if (!drag) return;
      const dy = e.clientY - drag.y;
      if (!dragMovedRef.current && Math.abs(dy) > 4) {
        dragMovedRef.current = true;
        // Capture only once a real drag starts, so plain clicks still reach
        // the items and navigate to them.
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (dragMovedRef.current) applyTarget(drag.start - dy / cfgRef.current.rowH, false);
    },
    [applyTarget]
  );

  const handlePointerEnd = useCallback((event) => {
    if (!dragRef.current) return;
    const pointerId = dragRef.current.id;
    if (rootRef.current?.hasPointerCapture(pointerId)) rootRef.current.releasePointerCapture(pointerId);
    dragRef.current = null;
    setIsDragging(false);
    if (event.type === 'pointercancel' && cfgRef.current.selectOnSettle) {
      cancelSettlement();
      applyTarget(committedRef.current, true);
    } else if (cfgRef.current.selectOnSettle) scheduleSettlement();
    else if (dragMovedRef.current) applyTarget(targetRef.current, true);
  }, [applyTarget, cancelSettlement, scheduleSettlement]);

  const handleItemClick = useCallback(
    index => {
      if (dragMovedRef.current) return;
      cancelSettlement();
      const cfg = cfgRef.current;
      const cur = targetRef.current;
      let d = index - (((cur % cfg.count) + cfg.count) % cfg.count);
      if (cfg.loop && cfg.count > 1) {
        if (d > cfg.count / 2) d -= cfg.count;
        else if (d < -cfg.count / 2) d += cfg.count;
      }
      applyTarget(cur + d, true);
      if (cfg.selectOnSettle) scheduleSettlement(0);
      else {
        committedRef.current = index;
        onSelectRef.current?.(index, cfg.items[index]);
      }
    },
    [applyTarget, cancelSettlement, scheduleSettlement]
  );

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (cfgRef.current.selectOnSettle) scheduleSettlement(0);
        else onSelectRef.current?.(selectedRef.current, cfgRef.current.items[selectedRef.current]);
        return;
      }
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        cancelSettlement();
        applyTarget(e.key === 'Home' ? 0 : cfgRef.current.count - 1, true);
        if (cfgRef.current.selectOnSettle) scheduleSettlement();
        return;
      }
      let delta = null;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') delta = -1;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') delta = 1;
      if (delta == null) return;
      e.preventDefault();
      cancelSettlement();
      applyTarget(Math.round(targetRef.current) + delta, true);
      if (cfgRef.current.selectOnSettle) scheduleSettlement();
    },
    [applyTarget, cancelSettlement, scheduleSettlement]
  );

  useEffect(() => {
    applyTarget(targetRef.current, false);
  }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, side, loop, smoothing, visibleItems, selectOnSettle, applyTarget]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      clearTimeout(wheelTimerRef.current);
      pendingSelectionRef.current = false;
      readyToSelectRef.current = false;
      audioRef.current?.pause();
    },
    []
  );

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-orientation="vertical"
      aria-activedescendant={`${optionId}-${selectedIndex}`}
      className={`relative h-full w-full select-none overflow-hidden rounded-xl outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-cyan-200/50 [touch-action:none] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}${className ? ` ${className}` : ''}`}
      style={{
        '--ow-text-color': textColor,
        '--ow-active-color': activeColor,
        '--ow-font-size': `${fontSize}rem`,
        '--ow-inset': `${inset}px`
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      {items.map((label, index) => (
        <div
          key={`${label}-${index}`}
          ref={el => {
            itemRefs.current[index] = el;
          }}
          role="option"
          id={`${optionId}-${index}`}
          aria-selected={selectedIndex === index}
          style={{ width: 'calc(100% - var(--ow-inset) - var(--ow-inset))' }}
          className={`absolute top-1/2 flex min-h-11 cursor-pointer items-center whitespace-nowrap leading-none will-change-[transform,opacity,filter] [font-size:var(--ow-font-size)] [color:color-mix(in_srgb,var(--ow-active-color)_calc(var(--ow-p,0)*100%),var(--ow-text-color))] ${
            side === 'right' ? 'right-[var(--ow-inset)] origin-right' : 'left-[var(--ow-inset)] origin-left'
          } ${selectedIndex === index ? 'font-medium' : 'font-extralight'}`}
          onClick={() => handleItemClick(index)}
        >
          {label}
        </div>
      ))}
    </div>
  );
};

export default OptionWheel;
