import { useEffect, useMemo, useRef } from 'react'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([PieChart, TooltipComponent, CanvasRenderer])

const categoryColors = [
  '#67e8f9',
  '#38bdf8',
  '#818cf8',
  '#a78bfa',
  '#f0abfc',
  '#fb7185',
  '#fb923c',
  '#fbbf24',
  '#4ade80',
]

const amountFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function NightingaleChart({ categories }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const chart = echarts.init(container, null, { renderer: 'canvas' })
    chartRef.current = chart

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    const maxTotal = Math.max(...categories.map((item) => item.total))

    chartRef.current?.setOption({
      color: categoryColors,
      tooltip: {
        trigger: 'item',
        confine: true,
        backgroundColor: '#151b2b',
        borderColor: 'rgba(255,255,255,0.12)',
        textStyle: { color: '#f8fafc' },
        formatter: ({ data }) =>
          `<strong>${escapeHtml(data.name)}</strong><br/>` +
          `${amountFormatter.format(data.total)} · ${data.percentage.toFixed(2)}%<br/>` +
          `${data.count} ${data.count === 1 ? 'expense' : 'expenses'}`,
      },
      series: [{
        type: 'pie',
        roseType: 'area',
        radius: ['15%', '86%'],
        center: ['50%', '50%'],
        label: { show: false },
        labelLine: { show: false },
        itemStyle: {
          borderColor: '#101525',
          borderWidth: 3,
          borderRadius: 8,
        },
        emphasis: {
          scaleSize: 7,
          itemStyle: { shadowBlur: 18, shadowColor: 'rgba(103,232,249,0.25)' },
        },
        data: categories.map((item) => ({
          name: item.category,
          // Keep every petal visible while preserving the exact amounts below.
          value: 0.18 + 0.82 * Math.pow(item.total / maxTotal, 0.6),
          total: item.total,
          percentage: item.percentage,
          count: item.count,
        })),
      }],
    }, { notMerge: true })
  }, [categories])

  return (
    <div
      ref={containerRef}
      className="h-[clamp(220px,70vw,300px)] w-full min-w-0 sm:h-[320px]"
      role="img"
      aria-label="Nightingale chart showing spending by category with a compressed petal scale; exact values are listed alongside it"
    />
  )
}

function CardMessage({ children, toneClassName = 'text-white/55' }) {
  return (
    <div className={`flex min-h-[320px] items-center justify-center rounded-[22px] border border-white/8 bg-white/[0.03] px-5 text-center text-sm ${toneClassName}`}>
      {children}
    </div>
  )
}

export default function CategoryBreakdownCard({
  isAuthReady,
  isAuthenticated,
  breakdownQuery,
}) {
  const monthLabel = breakdownQuery.data?.monthLabel ?? 'Current month'
  const categoryData = breakdownQuery.data?.categories
  const categories = useMemo(
    () => categoryData?.filter((item) => item.total > 0) ?? [],
    [categoryData]
  )

  let content
  if (!isAuthReady) {
    content = <CardMessage>Preparing your dashboard session</CardMessage>
  } else if (!isAuthenticated) {
    content = <CardMessage>Sign in to see your category breakdown</CardMessage>
  } else if (breakdownQuery.isPending) {
    content = <CardMessage>Loading category spending...</CardMessage>
  } else if (breakdownQuery.isError) {
    content = <CardMessage toneClassName="text-rose-200">Unable to load category spending right now</CardMessage>
  } else if (categories.length === 0) {
    content = <CardMessage>No category spending for this month yet</CardMessage>
  } else {
    content = (
      <div className="grid min-w-0 flex-1 items-center gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(210px,0.85fr)] lg:gap-6">
        <div className="mx-auto w-full max-w-[360px] min-w-0 rounded-[22px] border border-white/[0.06] bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.07),transparent_68%)] lg:max-w-none">
          <NightingaleChart categories={categories} />
        </div>

        <ul className="grid min-w-0 grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-2 lg:grid-cols-1" aria-label="Category spending amounts">
          {categories.map((item, index) => (
            <li key={item.category} className="flex min-w-0 items-center gap-2.5 rounded-xl px-1 py-2 hover:bg-white/[0.04] sm:gap-3 sm:px-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 break-words text-xs leading-4 text-white/75">
                {item.category}
              </span>
              <span className="shrink-0 whitespace-nowrap text-right">
                <span className="block text-xs font-semibold text-white">{amountFormatter.format(item.total)}</span>
                <span className="block text-[11px] text-white/45">{item.percentage.toFixed(2)}%</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <section className="h-full min-w-0 min-h-[390px] rounded-[28px] bg-[linear-gradient(180deg,rgba(13,16,34,0.72)_0%,rgba(6,8,18,0.74)_100%)] p-5 shadow-[0_24px_54px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-7">
      <div className="flex h-full flex-col gap-5">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight text-white">Category Breakdown</h2>
            <p className="text-sm leading-6 text-white/45">Where your spending went this month</p>
          </div>
          <span className="rounded-full border border-cyan-200/10 bg-cyan-200/[0.06] px-3 py-1 text-xs font-medium text-cyan-100/75">
            {monthLabel}
          </span>
        </div>
        {content}
      </div>
    </section>
  )
}
