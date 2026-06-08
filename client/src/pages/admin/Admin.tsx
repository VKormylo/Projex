import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import DashboardLayout from "~/components/dashboard-layout/DashboardLayout";
import { userService } from "~/services/user-service";
import { teamService } from "~/services/team-service";
import { useAuthContext } from "~/context/authContext";
import UsersTab from "./components/UsersTab";
import TeamsTab from "./components/TeamsTab";

type TabId = "users" | "teams";

export default function Admin() {
  const { user } = useAuthContext();
  const isAdmin = user?.role?.name === "Admin";
  const isPM = user?.role?.name === "Project Manager";

  const [tab, setTab] = useState<TabId>(() => (isAdmin ? "users" : "teams"));

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.list(),
    select: (r) => r.users,
    enabled: isAdmin,
  });

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: () => userService.listRoles(),
    select: (r) => r.roles,
  });

  const { data: teamsData } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamService.list(),
    select: (r) => r.teams,
  });

  const users = usersData ?? [];
  const roles = rolesData ?? [];
  const teams = teamsData ?? [];

  const canManageTeams = isAdmin || isPM;

  return (
    <DashboardLayout>
      <div>
        {isAdmin && (
          <div className="flex gap-1 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-1 w-fit mb-6">
            {([{ id: "users", label: "Користувачі" }, { id: "teams", label: "Команди" }] as { id: TabId; label: string }[]).map(
              ({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`rounded-md px-4 py-1.25 text-sm font-medium transition ${
                    tab === id ? "bg-white text-[#0f172b] shadow-sm" : "text-[#45556c] hover:text-[#0f172b]"
                  }`}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        )}

        {tab === "users" && isAdmin && <UsersTab users={users} roles={roles} />}
        {(tab === "teams" || !isAdmin) && (
          <TeamsTab teams={teams} canManage={canManageTeams} currentUserId={user?.id ?? ""} />
        )}
      </div>
    </DashboardLayout>
  );
}
