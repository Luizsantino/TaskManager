import { z } from "zod";

export const tarefaSchema = z.object({
  titulo: z.string().min(1, "O título da tarefa é obrigatório."),
  descricao: z.string().optional(),
  prazo: z
    .string()
    .optional()
    .refine(val => val === undefined || !isNaN(Date.parse(val)), { message: "Prazo inválido (deve ser ISO)." }),
  projetoId: z.number().refine(val => val > 0, { message: "O projetoId é obrigatório e deve ser positivo." }),
  assigneeId: z.number().optional(),
  status: z.enum(["pendente", "em_andamento", "concluida"]).optional(),
});

export const tarefaUpdateSchema = tarefaSchema.partial();