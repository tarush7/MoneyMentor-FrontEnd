import { supabase } from '../../../supabase'

function normalizeLabel(labelRelation) {
  if (Array.isArray(labelRelation)) return labelRelation[0] ?? null
  return labelRelation ?? null
}

function mapTransactionDetails(row) {
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
    accountLast4: row.account_last4,
    parsedChannel: row.parsed_channel,
    bankName: row.bank_name,
    bodyText: row.body_text,
    subjectRaw: row.subject_raw,
    amount: row.parsed_amount,
    direction: row.parsed_direction,
    currentLabel: label
      ? {
          primaryCategory: label.primary_category ?? null,
          customNote: label.custom_note ?? null,
          labelSource: label.label_source ?? null,
          ruleId: label.rule_id ?? null,
          isUserConfirmed: label.is_user_confirmed ?? null,
        }
      : null,
  }
}

export async function getTransactionDetails(transactionId) {
  if (!transactionId) return null

  const { data, error } = await supabase
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
        account_last4,
        parsed_channel,
        bank_name,
        body_text,
        subject_raw,
        parsed_amount,
        parsed_direction,
        transaction_labels (
          primary_category,
          custom_note,
          label_source,
          rule_id,
          is_user_confirmed
        )
      `
    )
    .eq('id', transactionId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) return null

  return mapTransactionDetails(data)
}
