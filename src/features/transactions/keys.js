export const transactionKeys = {
  all: ['transactions'],
  lists: () => [...transactionKeys.all, 'list'],
  list: (params) => [...transactionKeys.lists(), params],
  infiniteLists: () => [...transactionKeys.all, 'infinite-list'],
  infiniteList: (params) => [...transactionKeys.infiniteLists(), params],
  details: () => [...transactionKeys.all, 'detail'],
  detail: (transactionId) => [...transactionKeys.details(), transactionId],
}
