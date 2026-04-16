import { useMutation } from '@tanstack/react-query'
import { createTaggingRule } from '../api/createTaggingRule'

export function useCreateTaggingRuleMutation() {
  return useMutation({
    mutationFn: createTaggingRule,
  })
}
