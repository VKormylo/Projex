import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { teamService } from "~/services/team-service";
import type { TeamDto, TeamMemberDto } from "~/types/project.types";

interface Props {
  member: TeamMemberDto;
  team: TeamDto;
  canRemove: boolean;
}

export default function MemberRowDropdown({ member, team, canRemove }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const removeMut = useMutation({
    mutationFn: () => teamService.removeMember(team.id, member.userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function handleToggle() {
    if (!open && btnRef.current) setRect(btnRef.current.getBoundingClientRect());
    setOpen((v) => !v);
  }

  return (
    <div>
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <circle cx="10" cy="4" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="16" r="1.5" />
        </svg>
      </button>

      {open && rect && createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right,
            zIndex: 9999,
          }}
          className="w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1"
        >
          {canRemove && (
            <button
              onClick={() => { setOpen(false); removeMut.mutate(); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524L13.477 14.89zm1.414-1.414L6.524 5.11A6 6 0 0114.89 13.476zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
              Видалити з команди
            </button>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
