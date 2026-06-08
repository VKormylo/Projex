import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Button from "~/components/button/Button";
import { userService } from "~/services/user-service";
import { teamService } from "~/services/team-service";
import type { AdminUserDto, TeamDto } from "~/types/project.types";
import UserAvatar from "./UserAvatar";
import { mutErrMsg } from "../utils";

interface Props {
  team: TeamDto;
  onClose: () => void;
}

export default function AddMemberDialog({ team, onClose }: Props) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [found, setFound] = useState<AdminUserDto | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);

  const teamMembers = team.teamMember ?? [];
  const isAlreadyMember = (userId: string) => teamMembers.some((m) => m.userId === userId);

  async function handleSearch() {
    if (!email.trim()) return;
    setSearching(true);
    setFound(null);
    setNotFound(false);
    try {
      const res = await userService.findByEmail(email.trim());
      setFound(res.user);
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  }

  const addMut = useMutation({
    mutationFn: async () => {
      if (!found) return;
      await teamService.addMember(team.id, found.id);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["teams"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Додати учасника до команди</h2>
        <p className="text-sm text-gray-500 mb-5">
          Команда: <span className="font-medium text-gray-700">{team.name}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email користувача</label>
            <div className="flex gap-2">
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFound(null);
                  setNotFound(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                type="email"
                placeholder="Електронна адреса"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching || !email.trim()}
                className="px-4 py-2 rounded-lg bg-[#f3f3f5] text-sm font-medium text-gray-700 hover:bg-[#ebebed] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {searching ? "..." : "Знайти"}
              </button>
            </div>
            {notFound && (
              <p className="text-red-500 text-xs mt-1">Користувача з таким email не знайдено</p>
            )}
          </div>

          {found && (
            <div className="rounded-xl border border-gray-200 p-3 bg-gray-50">
              <div className="flex items-center gap-3">
                <UserAvatar name={found.fullName} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{found.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {found.email} · {found.position}
                  </p>
                </div>
                {isAlreadyMember(found.id) && (
                  <span className="ml-auto text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                    Вже в команді
                  </span>
                )}
              </div>
            </div>
          )}

          {addMut.isError && (
            <p className="text-red-500 text-sm">{mutErrMsg(addMut.error, "Помилка при додаванні")}</p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" onClick={onClose} variant="outlined" className="text-gray-700">
              Скасувати
            </Button>
            <Button
              type="button"
              onClick={() => addMut.mutate()}
              disabled={!found || isAlreadyMember(found.id) || addMut.isPending}
            >
              {addMut.isPending ? "Додавання..." : "Додати до команди"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
