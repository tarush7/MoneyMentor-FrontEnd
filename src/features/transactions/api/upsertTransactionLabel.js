import { supabase } from '../../../supabase'

export async function upsertTransactionLabel({
  transactionId,
  primaryCategory,
  customNote,
}) {
  const { data, error } = await supabase
    .from('transaction_labels')
    .upsert(
      {
        transaction_id: transactionId,
        primary_category: primaryCategory,
        custom_note: customNote || null,
        label_source: 'manual',
        rule_id: null,
        is_user_confirmed: true,
      },
      { onConflict: 'transaction_id' }
    )
    .select(
      `
        primary_category,
        custom_note,
        label_source,
        rule_id,
        is_user_confirmed
      `
    )
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return {
    primaryCategory: data.primary_category ?? null,
    customNote: data.custom_note ?? null,
    labelSource: data.label_source ?? null,
    ruleId: data.rule_id ?? null,
    isUserConfirmed: data.is_user_confirmed ?? null,
  }
}
