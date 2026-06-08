import { ResponseError } from "~/exceptions/response-error";
import type { AdminUserDto } from "~/types/project.types";

export const SUPER_ADMIN_EMAIL = "superadmin@projex.com";

export function isSuperAdmin(email: string | undefined | null) {
  return email === SUPER_ADMIN_EMAIL;
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getUserPrimaryRole(user: AdminUserDto | { role?: { name: string } | null }): string {
  return (user as AdminUserDto).role?.name ?? "Немає ролі";
}

export function roleBadgeClass(role: string): string {
  if (role === "Admin") return "text-[#7c3aed] bg-[#ede9fe]";
  if (role === "Project Manager") return "text-[#0369a1] bg-[#e0f2fe]";
  if (role === "Developer") return "text-[#166534] bg-[#dcfce7]";
  return "text-[#6b7280] bg-[#f3f4f6]";
}

export function hasRole(user: { role?: { name: string } | null }, roleName: string) {
  return user.role?.name === roleName;
}

export function mutErrMsg(err: unknown, fallback: string) {
  return err instanceof ResponseError ? err.message : fallback;
}
