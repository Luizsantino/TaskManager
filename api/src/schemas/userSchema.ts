import { z } from "zod";

export const userSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório."),
  cargo: z.string().min(1, "O cargo é obrigatório."),
});

// Para updates parciais
export const userUpdateSchema = userSchema.partial();