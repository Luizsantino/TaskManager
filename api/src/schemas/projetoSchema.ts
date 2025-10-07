import { z } from "zod";

export const projetoSchema = z.object({
  nome: z.string().min(1, "O nome do projeto é obrigatório."),
  descricao: z.string().min(1, "A descrição do projeto é obrigatória."),
  dataInicio: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), { message: "Data de início inválida (deve ser ISO)." }),
  dataFimPrevista: z
    .string()
    .refine(val => !isNaN(Date.parse(val)), { message: "Data fim prevista inválida (deve ser ISO)." }),
});

export const projetoUpdateSchema = projetoSchema.partial();