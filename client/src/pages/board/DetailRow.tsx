interface DetailRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

export default function DetailRow({ icon, label, children }: DetailRowProps) {
  return (
    <div className="py-3">
      <div className="mb-1 flex items-center gap-2 text-sm text-[#62748e]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}
