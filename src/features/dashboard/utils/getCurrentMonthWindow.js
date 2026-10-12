function toIsoDate(value) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getCurrentMonthWindow() {
  // Temporary September 2026 preview. Restore new Date() for the live month.
  const today = new Date(2026, 8, 30)

  const monthStartDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  )

  const tomorrow = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  )

  console.log('Dashboard reference date:', today)
  console.log('Start date:', toIsoDate(monthStartDate))
  console.log('End date:', toIsoDate(tomorrow))

  return {
    startDate: toIsoDate(monthStartDate),
    endDate: toIsoDate(tomorrow),
    monthLabel: monthStartDate.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    }),
  }
}
