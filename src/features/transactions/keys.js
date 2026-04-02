export const transactionKeys = {
  all: ['transactions'],
  lists: () => [...transactionKeys.all, 'list'],
  list: (params) => [...transactionKeys.lists(), params],
  details: () => [...transactionKeys.all, 'detail'],
  detail: (transactionId) => [...transactionKeys.details(), transactionId],
}