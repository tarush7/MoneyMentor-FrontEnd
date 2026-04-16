export async function createTaggingRule(payload) {
  console.groupCollapsed('[Tagging V2][Placeholder API] createTaggingRule')
  console.info('payload', payload)
  console.info(
    'status',
    'Frontend placeholder only. Connect this file to Supabase RPC next.'
  )
  console.groupEnd()

  return {
    status: 'placeholder',
    createdAt: new Date().toISOString(),
    ...payload,
  }
}
