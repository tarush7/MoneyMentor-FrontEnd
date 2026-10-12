function toDateKey(value) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
}

export function getMonthWindow(monthKey, today = new Date()) {
  const currentMonthKey = toDateKey(today).slice(0, 7)
  const key = monthKey ?? currentMonthKey
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(key)) throw new Error('Invalid dashboard month')

  const [year, month] = key.split('-').map(Number)
  const monthStart = new Date(0)
  monthStart.setFullYear(year, month - 1, 1)
  monthStart.setHours(0, 0, 0, 0)
  const nextMonth = new Date(monthStart)
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

  return {
    monthKey: key,
    year,
    monthName: monthStart.toLocaleDateString('en-IN', { month: 'long' }),
    monthLabel: monthStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    startDate: `${key}-01`,
    // The RPCs receive an exclusive end date; the current month stays month-to-date.
    endDate: toDateKey(key === currentMonthKey ? tomorrow : nextMonth),
  }
}
