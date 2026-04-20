const DEFAULT_ADMIN_USER_ID = '14be3a1b-ba47-4150-bc35-83763552379b'

export function getAdminUserId() {
  return import.meta.env.VITE_ADMIN_USER_ID?.trim() || DEFAULT_ADMIN_USER_ID
}

export function isAdminWriterUser(user) {
  return Boolean(user?.id && user.id === getAdminUserId())
}
