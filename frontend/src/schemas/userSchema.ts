import { z } from "zod";
export const createUserSchema = z.object({
    nome: z
      .string()
      .trim()
      .min(3, "Nome deve ter pelo menos 3 caracteres")
      .max(255, "Nome não pode ter mais de 255 caracteres"),
  
    cargo: z
      .string()
      .trim()
      .min(1, "O cargo é obrigatório.")
      .max(50, "Cargo não pode ter mais de 50 caracteres"),
  
    email: z
      .string()
      .trim()
      .email("Email inválido")
      .min(1, "O e-mail é obrigatório."),
  
    senha: z
      .string()
      .trim()
      .min(4, "Senha deve conter pelo menos 4 caracteres")
      .max(16, "Senha não pode ter mais de 16 caracteres"),
  });

export const updateUserSchema = createUserSchema.extend({
    id: z.number(),
});

export type createUserInput = z.infer<typeof createUserSchema>;
export type updateUserInput = z.infer<typeof updateUserSchema>;