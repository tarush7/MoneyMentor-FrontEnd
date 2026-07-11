import { supabase } from '../../../supabase'

function normalizeLabel(labelRelation) {
  if (Array.isArray(labelRelation)) return labelRelation[0] ?? null
  return labelRelation ?? null
}

function mapTransactionRow(row) {
  const label = normalizeLabel(row.transaction_labels)
  const merchantName = row.merchant_name
  const counterpartyName = row.counterparty_name
  const upiPayeeName = row.upi_payee_name
  const upiVpa = row.upi_vpa
  const upiReference = row.upi_reference

  return {
    id: row.id,
    messageDatetimeUtc: row.message_datetime_utc,
    parsedTxnDate: row.parsed_txn_date,
    merchantDisplay:
      merchantName ||
      counterpartyName ||
      upiPayeeName ||
      upiVpa ||
      upiReference ||
      'Unknown',
    merchantName,
    counterpartyName,
    counterpartyType: row.counterparty_type,
    upiPayeeName,
    upiVpa,
    upiReference,
    amount: row.parsed_amount,
    direction: row.parsed_direction,
    category: label?.primary_category ?? null,
    labelSource: label?.label_source ?? null,
    isUserConfirmed: label?.is_user_confirmed ?? null,
  }
}

export async function getTransactions({ page = 1, pageSize = 10 }) {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await supabase
    .from('transactions_enriched')
    .select(
      `
        id,
        message_datetime_utc,
        parsed_txn_date,
        merchant_name,
        counterparty_name,
        counterparty_type,
        upi_payee_name,
        upi_vpa,
        upi_reference,
        parsed_amount,
        parsed_direction,
        transaction_labels (
          primary_category,
          label_source,
          is_user_confirmed
        )
      `,
      { count: 'exact' }
    )
    .order('message_datetime_utc', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return {
    rows: (data ?? []).map(mapTransactionRow),
    totalCount: count ?? 0,
    page,
    pageSize,
  }
}
