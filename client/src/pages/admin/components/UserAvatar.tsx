import { getInitials } from "../utils";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md";
}

const COLORS = [
  "bg-blue-200 text-blue-800",
  "bg-green-200 text-green-800",
  "bg-purple-200 text-purple-800",
  "bg-orange-200 text-orange-800",
  "bg-pink-200 text-pink-800",
  "bg-teal-200 text-teal-800",
];

export default function UserAvatar({ name, size = "md" }: UserAvatarProps) {
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  const cls = size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium ${color} ${cls}`}
    >
      {getInitials(name)}
    </span>
  );
}
