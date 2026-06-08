import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Button from "~/components/button/Button";
import { userService } from "~/services/user-service";
import type { RoleDto } from "~/types/project.types";
import { mutErrMsg } from "../utils";

const schema = z.object({
  fullName: z.string().min(2, "Мінімум 2 символи"),
  email: z.string().email("Невалідний email"),
  password: z.string().min(8, "Мінімум 8 символів"),
  position: z.string().min(2, "Мінімум 2 символи"),
});
type FormValues = z.infer<typeof schema>;

const FIELDS = [
  { name: "fullName", label: "Повне ім'я", placeholder: "Ім'я та прізвище", type: "text" },
  { name: "email", label: "Email", placeholder: "Електронна адреса", type: "email" },
  { name: "password", label: "Пароль", placeholder: "Мінімум 8 символів", type: "password" },
  { name: "position", label: "Посада", placeholder: "Посада", type: "text" },
] as const;

interface Props {
  roles: RoleDto[];
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateUserDialog({ roles, onClose, onCreated }: Props) {
  const qc = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const createMut = useMutation({
    mutationFn: userService.create,
    onSuccess: async (res) => {
      if (selectedRole) await userService.assignRole(res.user.id, selectedRole);
      await qc.invalidateQueries({ queryKey: ["users"] });
      onCreated();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Додати користувача</h2>
        <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4">
          {FIELDS.map(({ name, label, placeholder, type }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                {...register(name)}
                type={type}
                placeholder={placeholder}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40"
              />
              {errors[name] && (
                <p className="text-red-500 text-xs mt-1">{errors[name]?.message}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
            <select
              value={selectedRole ?? ""}
              onChange={(e) => setSelectedRole(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40 bg-white"
            >
              <option value="">Без ролі</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {createMut.isError && (
            <p className="text-red-500 text-sm">{mutErrMsg(createMut.error, "Помилка при створенні")}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" onClick={onClose} variant="outlined" className="text-gray-700">
              Скасувати
            </Button>
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending ? "Збереження..." : "Додати"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
