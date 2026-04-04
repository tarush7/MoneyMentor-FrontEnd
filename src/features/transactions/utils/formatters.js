export function formatAmount(value) {
  if (value == null) return '—'

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDateTimeToIST(messageDatetimeUtc, parsedTxnDate) {
  if (messageDatetimeUtc) {
    const date = new Date(messageDatetimeUtc)

    const datePart = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)

    const timePart = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)

    return { date: datePart, time: `${timePart} IST` }
  }

  if (parsedTxnDate) {
    return { date: parsedTxnDate, time: '—' }
  }

  return { date: '—', time: '—' }
}

export function getDirectionBadgeClass(direction) {
  if (direction === 'DEBIT') return 'badge badge-error badge-outline'
  if (direction === 'CREDIT') return 'badge badge-success badge-outline'
  return 'badge badge-ghost'
}

export function getCategoryBadgeClass(category) {
  if (!category) return 'badge badge-warning badge-outline'
  return 'badge badge-info badge-outline'
}
