import { useMemo, useRef, useState } from 'react'
import GlideSelect from '../../../components/reactbits/GlideSelect'
import OptionWheel from '../../../components/reactbits/OptionWheel'
import { getMonthWindow } from '../utils/getMonthWindow'

export default function DashboardMonthPicker({ monthKey, onMonthChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef(null)
  const currentYear = new Date().getFullYear()
  const selectedPeriod = getMonthWindow(monthKey)
  const monthIndex = Number(selectedPeriod.monthKey.slice(5)) - 1
  const months = useMemo(() => Array.from({ length: 12 }, (_, index) => {
    const period = getMonthWindow(`${selectedPeriod.year}-${String(index + 1).padStart(2, '0')}`)
    return { value: period.monthKey, label: period.monthName }
  }), [selectedPeriod.year])
  const monthLabels = useMemo(() => months.map((month) => month.label), [months])
  const years = Array.from({ length: 7 }, (_, index) => String(currentYear - 5 + index))

  return (
    <GlideSelect
      options={months}
      open={isOpen}
      onOpenChange={setIsOpen}
      triggerElementRef={triggerRef}
      value={selectedPeriod.monthKey}
      triggerLabel={selectedPeriod.monthLabel}
      ariaLabel="Choose dashboard month"
      className="dashboard-month-select sm:shrink-0"
      surfaceColor="rgba(255,255,255,0.04)"
      highlightColor="#283341"
      align="right"
      menuContent={(
        <>
          <div className="flex items-center justify-between gap-4 px-1 pb-2">
            <span className="text-xs font-medium text-white/55">Choose month</span>
            <GlideSelect
              options={years}
              value={String(selectedPeriod.year)}
              onChange={(year) => onMonthChange(`${year}-${selectedPeriod.monthKey.slice(5)}`)}
              ariaLabel="Year"
              align="right"
              menuWidth={104}
              radius={10}
              viewportPadding={112}
            />
          </div>
          <div className="relative h-[168px]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-1 top-1/2 h-12 -translate-y-1/2 rounded-xl border border-cyan-200/10 bg-cyan-200/[0.05]" />
            <OptionWheel
              key={selectedPeriod.year}
              items={monthLabels}
              defaultSelected={monthIndex}
              selectOnSettle
              settleDelay={180}
              onSelect={(month) => {
                onMonthChange(months[month].value)
              }}
              ariaLabel="Month"
              fontSize={1.125}
              spacing={3}
              inset={24}
              tilt={4}
              curve={0.5}
              blur={0}
              fade={0.65}
              minOpacity={0}
              smoothing={100}
              visibleItems={3}
              activeColor="#cffafe"
              textColor="#8b91a0"
            />
          </div>
        </>
      )}
    />
  )
}
