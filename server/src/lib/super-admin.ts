export const SUPER_ADMIN_EMAIL = "superadmin@projex.com";

export function isSuperAdmin(email: string | undefined | null) {
  return email === SUPER_ADMIN_EMAIL;
}
