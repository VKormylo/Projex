import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import Button from "~/components/button/Button";
import { teamService } from "~/services/team-service";
import type { TeamDto } from "~/types/project.types";
import { mutErrMsg } from "../utils";

const schema = z.object({ name: z.string().min(2, "Мінімум 2 символи") });
type FormValues = z.infer<typeof schema>;

interface Props {
  team?: TeamDto | null;
  onClose: () => void;
}

export default function TeamDialog({ team, onClose }: Props) {
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: team?.name ?? "" },
  });

  const saveMut = useMutation({
    mutationFn: async (data: FormValues) => {
      if (team) return teamService.update(team.id, data.name);
      return teamService.create(data.name);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["teams"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">
          {team ? "Редагувати команду" : "Створити команду"}
        </h2>
        <form onSubmit={handleSubmit((d) => saveMut.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Назва команди</label>
            <input
              {...register("name")}
              placeholder="Назва команди"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          {saveMut.isError && (
            <p className="text-red-500 text-sm">{mutErrMsg(saveMut.error, "Помилка при збереженні")}</p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" onClick={onClose} variant="outlined" className="text-gray-700">
              Скасувати
            </Button>
            <Button type="submit" disabled={saveMut.isPending}>
              {saveMut.isPending ? "Збереження..." : team ? "Зберегти" : "Створити"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
