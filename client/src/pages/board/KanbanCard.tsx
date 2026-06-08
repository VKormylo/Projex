import { Draggable } from "@hello-pangea/dnd";

import Badge from "~/components/badge/Badge";
import { CalendarIcon } from "~/components/svg/Svg";
import type { TaskDto } from "~/types/sprint.types";
import { getTaskCode } from "~/utils/project-key";

function priorityBadgeVariant(p: string) {
  const map: Record<string, string> = { low: "low", medium: "medium", high: "high", critical: "critical" };
  return map[p] ?? "medium";
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("uk-UA", { day: "2-digit", month: "short" });
}

interface KanbanCardProps {
  task: TaskDto;
  index: number;
  onClick: () => void;
}

export default function KanbanCard({ task, index, onClick }: KanbanCardProps) {
  const assigneeName = task.assignee?.fullName ?? null;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`cursor-pointer rounded-lg border border-[#e2e8f0] bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
            snapshot.isDragging ? "shadow-lg ring-2 ring-[#3b82f6]/30" : ""
          }`}
        >
          <div className="mb-2 flex items-start justify-between">
            <span className="text-xs font-medium text-[#62748e]">
              {getTaskCode(task.project?.name, task.id)}
            </span>
            <Badge variant={priorityBadgeVariant(task.priority) as any} />
          </div>

          <p className="mb-3 overflow-hidden text-ellipsis break-all text-sm font-medium leading-5 text-[#0f172b] line-clamp-2">
            {task.title}
          </p>

          <div className="flex items-center justify-between">
            {assigneeName ? (
              <div
                className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[10px] font-semibold text-[#1447e6]"
                title={assigneeName}
              >
                {initials(assigneeName)}
              </div>
            ) : (
              <div className="size-6" />
            )}
            {task.dueDate ? (
              <span className="flex items-center gap-1 text-xs text-[#62748e]">
                <CalendarIcon />
                {formatDate(task.dueDate)}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </Draggable>
  );
}
