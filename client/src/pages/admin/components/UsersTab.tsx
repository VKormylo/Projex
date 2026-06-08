import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Badge from "~/components/badge/Badge";
import Button from "~/components/button/Button";
import { ChevronDownIcon } from "~/components/svg/Svg";
import { userService } from "~/services/user-service";
import { baseService } from "~/services/base-service";
import { URLs } from "~/constants/request";
import { useAuthContext } from "~/context/authContext";
import { useClickOutside } from "~/hooks/useClickOutside";
import type { AdminUserDto, RoleDto } from "~/types/project.types";
import UserAvatar from "./UserAvatar";
import UserRowDropdown from "./UserRowDropdown";
import CreateUserDialog from "./CreateUserDialog";
import EditUserDialog from "./EditUserDialog";
import { formatDate, getUserPrimaryRole, hasRole, isSuperAdmin, roleBadgeClass } from "../utils";

interface Props {
  users: AdminUserDto[];
  roles: RoleDto[];
}

export default function UsersTab({ users, roles }: Props) {
  const qc = useQueryClient();
  const { user: currentUser } = useAuthContext();

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleDropOpen, setRoleDropOpen] = useState(false);
  const [statusDropOpen, setStatusDropOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<AdminUserDto | null>(null);
  const [seedDone, setSeedDone] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const roleDropRef = useClickOutside<HTMLDivElement>(() => setRoleDropOpen(false));
  const statusDropRef = useClickOutside<HTMLDivElement>(() => setStatusDropOpen(false));

  const adminRoleId = roles.find((r) => r.name === "Admin")?.id ?? null;
  const devRoleId = roles.find((r) => r.name === "Developer")?.id ?? null;
  const roleOptions = useMemo(() => ["", ...roles.map((r) => r.name)], [roles]);
  const canManageDatabase = isSuperAdmin(currentUser?.email);

  const seedMut = useMutation({
    mutationFn: () =>
      baseService.request<{ users: number; sprints: number; tasks: number }>({
        method: "POST",
        url: URLs.admin.seed,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
      await qc.invalidateQueries({ queryKey: ["teams"] });
      setSeedDone(true);
    },
  });

  const clearMut = useMutation({
    mutationFn: () =>
      baseService.request<{ cleared: boolean }>({ method: "POST", url: URLs.admin.clear }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["users"] });
      await qc.invalidateQueries({ queryKey: ["teams"] });
      setSeedDone(false);
      setConfirmClear(false);
    },
  });

  const toggleActiveMut = useMutation({
    mutationFn: (u: AdminUserDto) => userService.update(u.id, { isActive: !u.isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const assignAdminMut = useMutation({
    mutationFn: async (u: AdminUserDto) => {
      const isAdmin = hasRole(u, "Admin");
      const roleToAssign = isAdmin ? devRoleId : adminRoleId;
      if (roleToAssign) await userService.assignRole(u.id, roleToAssign);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      pms: users.filter((u) => u.role?.name === "Project Manager").length,
      devs: users.filter((u) => u.role?.name === "Developer").length,
    }),
    [users],
  );

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        const matchSearch =
          !search ||
          u.fullName.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase());
        const matchRole = !roleFilter || u.role?.name === roleFilter;
        const matchStatus =
          !statusFilter || (statusFilter === "active" ? u.isActive : !u.isActive);
        return matchSearch && matchRole && matchStatus;
      }),
    [users, search, roleFilter, statusFilter],
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[30px] font-bold leading-9 text-[#0f172b]">Адміністрування</h1>
          <p className="text-sm text-[#45556c] mt-1">Керування користувачами та ролями системи</p>
        </div>
        <div className="flex items-center gap-2">
          {canManageDatabase ? (
            <>
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                disabled={clearMut.isPending}
                className="flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {clearMut.isPending ? "Очищення..." : "Очистити БД"}
              </button>
              <button
                type="button"
                onClick={() => seedMut.mutate()}
                disabled={seedMut.isPending || seedDone}
                title={seedDone ? "Вже заповнено" : seedMut.isError ? "Помилка (можливо вже заповнено)" : "Заповнити тестовими даними"}
                className="flex h-9 items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] px-4 text-sm font-medium text-[#45556c] hover:bg-[#f1f5f9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                  <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                  <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                </svg>
                {seedMut.isPending ? "Заповнення..." : seedDone ? "Заповнено" : "Заповнити даними"}
              </button>
            </>
          ) : null}
          <Button type="button" onClick={() => setShowCreate(true)} className="gap-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Додати користувача
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Всього користувачів", value: stats.total, color: "text-[#0f172b]" },
          { label: "Активні", value: stats.active, color: "text-[#16a34a]" },
          { label: "Project Managers", value: stats.pms, color: "text-[#0369a1]" },
          { label: "Developers", value: stats.devs, color: "text-[#7c3aed]" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#e2e8f0] px-5 py-4">
            <p className="text-sm text-[#45556c]">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] px-5 py-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#717182]">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Пошук користувача..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30"
            />
          </div>

          <div ref={roleDropRef} className="relative">
            <button
              onClick={() => setRoleDropOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#45556c] hover:bg-[#f1f5f9] transition-colors min-w-40"
            >
              <span className="flex-1 text-left">{roleFilter || "Всі ролі"}</span>
              <ChevronDownIcon className={`w-4 h-4 shrink-0 transition-transform ${roleDropOpen ? "rotate-180" : ""}`} />
            </button>
            {roleDropOpen && (
              <div className="absolute left-0 z-20 mt-1 w-48 bg-white rounded-xl shadow-xl border border-[#e2e8f0] py-1">
                {roleOptions.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRoleFilter(r); setRoleDropOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f8fafc] transition-colors ${roleFilter === r ? "text-[#3b82f6] font-medium" : "text-[#374151]"}`}
                  >
                    {r || "Всі ролі"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div ref={statusDropRef} className="relative">
            <button
              onClick={() => setStatusDropOpen((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#45556c] hover:bg-[#f1f5f9] transition-colors min-w-40"
            >
              <span className="flex-1 text-left">
                {statusFilter === "active" ? "Активні" : statusFilter === "inactive" ? "Неактивні" : "Всі статуси"}
              </span>
              <ChevronDownIcon className={`w-4 h-4 shrink-0 transition-transform ${statusDropOpen ? "rotate-180" : ""}`} />
            </button>
            {statusDropOpen && (
              <div className="absolute left-0 z-20 mt-1 w-40 bg-white rounded-xl shadow-xl border border-[#e2e8f0] py-1">
                {[
                  { value: "", label: "Всі статуси" },
                  { value: "active", label: "Активні" },
                  { value: "inactive", label: "Неактивні" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => { setStatusFilter(value); setStatusDropOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f8fafc] transition-colors ${statusFilter === value ? "text-[#3b82f6] font-medium" : "text-[#374151]"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#e2e8f0]">
              {["Користувач", "Email", "Роль", "Статус", "Задач", "Дата приєднання", "Дії"].map((h, i) => (
                <th key={h} className={`text-sm font-medium text-[#45556c] px-4 py-3 ${i === 6 ? "text-right" : "text-left"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-sm text-[#45556c]">
                  Користувачів не знайдено
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const primaryRole = getUserPrimaryRole(u);
                return (
                  <tr key={u.id} className="hover:bg-[#f8fafc]/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.fullName} />
                        <div>
                          <p className="text-sm font-medium text-[#0f172b]">{u.fullName}</p>
                          <p className="text-xs text-[#45556c]">{u.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#45556c]">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-medium ${roleBadgeClass(primaryRole)}`}>
                        {primaryRole === "Admin" && (
                          <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3 mr-1">
                            <path d="M6 1l1.39 2.81L10.5 4.24l-2.25 2.19.53 3.09L6 8l-2.78 1.52.53-3.09L1.5 4.24l3.11-.43L6 1z" />
                          </svg>
                        )}
                        {primaryRole}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.isActive ? "active" : "cancelled"} label={u.isActive ? "Активний" : "Неактивний"} />
                    </td>
                    <td className="px-4 py-3 text-sm text-[#45556c]">{u._count.assigned}</td>
                    <td className="px-4 py-3 text-sm text-[#45556c]">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== currentUser?.id && (
                        <UserRowDropdown
                          user={u}
                          onEdit={() => setEditUser(u)}
                          onToggleActive={() => toggleActiveMut.mutate(u)}
                          onAssignAdmin={() => assignAdminMut.mutate(u)}
                        />
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm clear dialog */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Очистити базу даних?</h3>
            <p className="text-sm text-gray-600 mb-5">
              Буде видалено всі проекти, спринти, задачі, команди та користувачів (крім вашого акаунту). Цю дію неможливо скасувати.
            </p>
            {clearMut.isError && <p className="text-red-500 text-sm mb-3">Помилка при очищенні</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Скасувати
              </button>
              <button
                onClick={() => clearMut.mutate()}
                disabled={clearMut.isPending}
                className="px-4 py-2 rounded-lg bg-red-600 text-sm text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {clearMut.isPending ? "Очищення..." : "Очистити"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <CreateUserDialog roles={roles} onClose={() => setShowCreate(false)} onCreated={() => setShowCreate(false)} />
      )}
      {editUser && <EditUserDialog user={editUser} roles={roles} onClose={() => setEditUser(null)} />}
    </>
  );
}
