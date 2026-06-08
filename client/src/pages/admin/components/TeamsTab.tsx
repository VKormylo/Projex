import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Badge from "~/components/badge/Badge";
import Button from "~/components/button/Button";
import { ChevronDownIcon } from "~/components/svg/Svg";
import { teamService } from "~/services/team-service";
import { useClickOutside } from "~/hooks/useClickOutside";
import type { TeamDto } from "~/types/project.types";
import UserAvatar from "./UserAvatar";
import MemberRowDropdown from "./MemberRowDropdown";
import TeamDialog from "./TeamDialog";
import AddMemberDialog from "./AddMemberDialog";
import { getUserPrimaryRole, hasRole, roleBadgeClass } from "../utils";

interface Props {
  teams: TeamDto[];
  canManage: boolean;
  currentUserId: string;
}

export default function TeamsTab({ teams, canManage, currentUserId }: Props) {
  const qc = useQueryClient();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(teams[0]?.id ?? null);
  const [teamDropOpen, setTeamDropOpen] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [editTeam, setEditTeam] = useState<TeamDto | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);

  const teamDropRef = useClickOutside<HTMLDivElement>(() => setTeamDropOpen(false));

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) ?? null;
  const currentTeam = selectedTeam ?? teams[0] ?? null;
  const members = currentTeam?.teamMember ?? [];

  const deleteMut = useMutation({
    mutationFn: (id: string) => teamService.delete(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["teams"] });
      setSelectedTeamId(teams.find((t) => t.id !== selectedTeamId)?.id ?? null);
    },
  });

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[30px] font-bold leading-9 text-[#0f172b]">Команди</h1>
          <p className="text-sm text-[#45556c] mt-1">Керування командами та їх учасниками</p>
        </div>
        {canManage && (
          <Button type="button" onClick={() => setShowCreateTeam(true)} className="gap-2">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Нова команда
          </Button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] py-20 text-center">
          <p className="text-[#45556c] text-sm">Команд ще немає</p>
          {canManage && (
            <button
              onClick={() => setShowCreateTeam(true)}
              className="mt-3 text-[#3b82f6] text-sm font-medium hover:underline"
            >
              Створити першу команду
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Team selector + actions */}
          <div className="flex items-center gap-3 mb-6">
            <div ref={teamDropRef} className="relative">
              <button
                onClick={() => setTeamDropOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#e2e8f0] bg-white text-sm font-medium text-[#0f172b] hover:bg-[#f8fafc] transition-colors min-w-48"
              >
                <span className="flex-1 text-left truncate">{currentTeam?.name ?? "Виберіть команду"}</span>
                <ChevronDownIcon className={`w-4 h-4 shrink-0 transition-transform ${teamDropOpen ? "rotate-180" : ""}`} />
              </button>
              {teamDropOpen && (
                <div className="absolute left-0 z-20 mt-1 w-56 bg-white rounded-xl shadow-xl border border-[#e2e8f0] py-1 max-h-56 overflow-y-auto">
                  {teams.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setSelectedTeamId(t.id); setTeamDropOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-[#f8fafc] transition-colors ${currentTeam?.id === t.id ? "text-[#3b82f6] font-medium" : "text-[#374151]"}`}
                    >
                      {t.name}
                      <span className="ml-1 text-xs text-[#45556c]">({t.teamMember?.length ?? 0})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {canManage && currentTeam && (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setEditTeam(currentTeam)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-sm text-[#45556c] hover:bg-[#f8fafc] transition-colors"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Редагувати
                </button>
                <button
                  onClick={() => deleteMut.mutate(currentTeam.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 bg-white text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Видалити
                </button>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] px-5 py-4">
              <p className="text-sm text-[#45556c]">Учасників</p>
              <p className="text-3xl font-bold text-[#0f172b] mt-1">{members.length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#e2e8f0] px-5 py-4">
              <p className="text-sm text-[#45556c]">Активних</p>
              <p className="text-3xl font-bold text-[#16a34a] mt-1">{members.filter((m) => m.user.isActive).length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#e2e8f0] px-5 py-4">
              <p className="text-sm text-[#45556c]">Адміністратор</p>
              <p className="text-sm font-semibold text-[#7c3aed] mt-2 truncate">
                {members.find((m) => hasRole(m.user, "Admin"))?.user.fullName ?? "—"}
              </p>
            </div>
          </div>

          {/* Members table */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2e8f0]">
              <p className="text-sm font-medium text-[#0f172b]">Учасники команди</p>
              {canManage && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-1.5 text-sm text-[#3b82f6] font-medium hover:text-[#2563eb] transition-colors"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Додати учасника
                </button>
              )}
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f1f5f9]">
                  {["Учасник", "Email", "Посада", "Роль", "Статус", "Дії"].map((h, i) => (
                    <th key={h} className={`text-sm font-medium text-[#45556c] px-4 py-3 ${i === 5 ? "text-right" : "text-left"}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-[#45556c]">
                      В цій команді ще немає учасників
                    </td>
                  </tr>
                ) : (
                  members.map((m) => {
                    const primaryRole = getUserPrimaryRole(m.user as any);
                    return (
                      <tr key={m.userId} className="hover:bg-[#f8fafc]/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <UserAvatar name={m.user.fullName} />
                            <p className="text-sm font-medium text-[#0f172b]">{m.user.fullName}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#45556c]">{m.user.email}</td>
                        <td className="px-4 py-3 text-sm text-[#45556c]">{m.user.position ?? "—"}</td>
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
                          <Badge variant={m.user.isActive ? "active" : "cancelled"} label={m.user.isActive ? "Активний" : "Неактивний"} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {canManage && currentTeam && m.userId !== currentUserId && (
                            <MemberRowDropdown member={m} team={currentTeam} canRemove={m.userId !== currentUserId} />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(showCreateTeam || editTeam) && (
        <TeamDialog
          team={editTeam}
          onClose={() => { setShowCreateTeam(false); setEditTeam(null); }}
        />
      )}
      {showAddMember && currentTeam && (
        <AddMemberDialog team={currentTeam} onClose={() => setShowAddMember(false)} />
      )}
    </>
  );
}
