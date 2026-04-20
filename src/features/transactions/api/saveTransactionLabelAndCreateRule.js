import { supabase } from '../../../supabase'

export async function saveTransactionLabelAndCreateRule({
  transactionId,
  primaryCategory,
  ruleType,
  customNote,
}) {
  const rpcPayload = {
    p_transaction_id: transactionId,
    p_primary_category: primaryCategory,
    p_rule_type: ruleType,
    p_custom_note: customNote || null,
  }

  console.groupCollapsed(
    '[Tagging V2][API] saveTransactionLabelAndCreateRule'
  )
  console.info('rpcPayload', rpcPayload)

  const { data, error } = await supabase.rpc(
    'save_transaction_label_and_create_rule',
    rpcPayload
  )

  if (error) {
    console.error('rpcError', error)
    console.groupEnd()
    throw new Error(error.message)
  }

  console.info('rpcResult', data)
  console.groupEnd()

  return {
    ruleId: data?.ruleId ?? null,
    ruleType: data?.ruleType ?? ruleType,
    matchValue: data?.matchValue ?? null,
    primaryCategory: data?.primaryCategory ?? primaryCategory,
    customNote: data?.customNote ?? (customNote || null),
    matchedTransactionCount: data?.matchedTransactionCount ?? 0,
    affectedTransactionCount: data?.affectedTransactionCount ?? 0,
    createdFromTransactionId: data?.createdFromTransactionId ?? transactionId,
  }
}
