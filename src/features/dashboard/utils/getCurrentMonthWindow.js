function toIsoDate(value) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getCurrentMonthWindow() {
  const today = new Date()
  const monthStartDate = new Date(today.getFullYear(), today.getMonth(), 1)

  return {
    startDate: toIsoDate(monthStartDate),
    endDate: toIsoDate(today),
    monthLabel: monthStartDate.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    }),
  }
}
